/**
 * OpenAI Realtime Session (per-connection) — GA API (2025+)
 *
 * Hybrid: OpenAI Realtime for VAD + STT + LLM text; ElevenLabs for TTS.
 */

'use strict';

const WebSocket = require('ws');
const EventEmitter = require('events');

const DEFAULT_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-mini';

const VERBOSE = process.env.OPENAI_RT_VERBOSE === '1';

const FATAL_ERROR_CODES = new Set([
  'model_not_found',
  'beta_api_shape_disabled',
  'invalid_api_key',
  'account_deactivated',
]);

class OpenAIRealtimeSession extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.apiKey = process.env.OPENAI_API_KEY;
    if (!this.apiKey) throw new Error('OPENAI_API_KEY is not set');

    this.instructions = opts.instructions || 'You are a helpful AI assistant.';
    this.language = opts.language || 'tr';
    this.temperature = typeof opts.temperature === 'number' ? opts.temperature : 0.8;
    this.model = opts.model || DEFAULT_MODEL;

    this.ws = null;
    this.isReady = false;
    this.closed = false;
    this.currentResponseId = null;
    this._sessionConfigured = false;
    this._audioBytesSent = 0;
    this._audioChunksSent = 0;
    this._audioBytesDropped = 0;
    this._connectError = null;
  }

  async connect() {
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(this.model)}`;
    console.log(`[OPENAI-RT] 🔌 Connecting (GA) — model=${this.model}`);

    this.ws = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    await new Promise((resolve, reject) => {
      const onOpen = () => {
        this.ws.off('error', onErr);
        resolve();
      };
      const onErr = (err) => {
        this.ws.off('open', onOpen);
        reject(err);
      };
      this.ws.once('open', onOpen);
      this.ws.once('error', onErr);
      setTimeout(() => {
        if (this.ws.readyState !== WebSocket.OPEN) {
          reject(new Error('OpenAI connect timeout (10s)'));
        }
      }, 10000);
    });

    this._attachHandlers();

    await new Promise((resolve, reject) => {
      let settled = false;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.off('session_ready', onReady);
        this.off('closed', onClosed);
        this.off('api_error', onApiError);
        fn(value);
      };

      const onReady = () => {
        console.log('[OPENAI-RT] ✅ session ready (created/updated)');
        finish(resolve);
      };
      const onClosed = ({ code, reason }) => {
        const msg = `OpenAI closed before session ready (${code}): ${reason || this._connectError || 'unknown'}`;
        finish(reject, new Error(msg));
      };
      const onApiError = (event) => {
        const code = event?.error?.code;
        const message = event?.error?.message || code;
        this._connectError = message;
        if (FATAL_ERROR_CODES.has(code)) {
          console.error(`[OPENAI-RT] ❌ Fatal during connect: ${message}`);
          finish(reject, new Error(message));
        }
      };

      const timer = setTimeout(() => {
        finish(reject, new Error('OpenAI session.created timeout (8s)'));
      }, 8000);

      this.once('session_ready', onReady);
      this.once('closed', onClosed);
      this.on('api_error', onApiError);
    });

    if (this.closed || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('OpenAI socket closed before session.update');
    }

    await this._sendSessionUpdate();

    await new Promise((resolve) => {
      const t = setTimeout(() => {
        console.warn('[OPENAI-RT] ⚠️ session.updated not received within 3s — continuing');
        resolve();
      }, 3000);
      const onUpdated = () => {
        clearTimeout(t);
        this.off('session_ready', onUpdated);
        resolve();
      };
      this.once('session_ready', onUpdated);
    });

    if (this.closed || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('OpenAI socket closed after session.update');
    }

    this.isReady = true;
    console.log(
      `[OPENAI-RT] ✅ Ready — model=${this.model} (GA, text-only output)`
    );
  }

  async _sendSessionUpdate() {
    const LANG_NAMES = {
      tr: 'Turkish', en: 'English', de: 'German', es: 'Spanish',
      fr: 'French', it: 'Italian', pt: 'Portuguese', ru: 'Russian',
      ja: 'Japanese', ko: 'Korean', zh: 'Chinese', hi: 'Hindi',
      ar: 'Arabic',
    };
    const defaultLanguage = LANG_NAMES[this.language] || this.language;

    const instructions = `${this.instructions}

LANGUAGE RULES (very important):
- Always respond in the exact same language the user is speaking right now.
- If you haven't heard the user yet, respond in ${defaultLanguage} (code: ${this.language}).
- Never switch language unless the user does first.

TONE:
- Natural phone call — short, warm replies (1–2 sentences).`;

    console.log('[OPENAI-RT] 📤 session.update (GA)');
    this._send({
      type: 'session.update',
      session: {
        type: 'realtime',
        instructions,
        output_modalities: ['text'],
        audio: {
          input: {
            format: { type: 'audio/pcm', rate: 24000 },
            transcription: { model: 'whisper-1' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.7,
              prefix_padding_ms: 200,
              silence_duration_ms: 600,
              create_response: false,
              interrupt_response: false,
            },
          },
        },
      },
    });
    this._sessionConfigured = true;
  }

  _attachHandlers() {
    this.ws.on('message', (raw) => {
      let event;
      try {
        event = JSON.parse(raw.toString());
      } catch (e) {
        console.warn('[OPENAI-RT] ⚠️ Non-JSON message');
        return;
      }

      if (VERBOSE && !event.type?.startsWith('response.')) {
        console.log(`[OPENAI-RT] ← ${event.type}`);
      }

      switch (event.type) {
        case 'session.created':
          console.log('[OPENAI-RT] session.created');
          this.emit('session_ready');
          break;

        case 'session.updated':
          console.log('[OPENAI-RT] session.updated');
          this.emit('session_ready');
          break;

        case 'input_audio_buffer.speech_started':
          console.log('[OPENAI-RT] 🗣️ VAD speech_started');
          this.emit('user_speech_started', event);
          break;

        case 'input_audio_buffer.speech_stopped':
          console.log('[OPENAI-RT] 🤐 VAD speech_stopped');
          this.emit('user_speech_stopped', event);
          break;

        case 'conversation.item.input_audio_transcription.completed': {
          const t = (event.transcript || '').trim();
          console.log(`[OPENAI-RT] 📝 transcript: "${t.substring(0, 120)}"`);
          this.emit('user_transcript', {
            itemId: event.item_id,
            transcript: event.transcript || '',
          });
          break;
        }

        case 'response.created':
          this.currentResponseId = event.response?.id || null;
          console.log(`[OPENAI-RT] 🤖 response.created id=${this.currentResponseId}`);
          this.emit('response_created', event);
          break;

        case 'response.text.delta':
        case 'response.output_text.delta':
          if (event.delta) this.emit('text_delta', { delta: event.delta });
          break;

        case 'response.text.done':
        case 'response.output_text.done':
          this.emit('text_done', { text: event.text || '' });
          break;

        case 'response.done':
          this.currentResponseId = null;
          console.log('[OPENAI-RT] ✅ response.done');
          this.emit('response_done', event);
          break;

        case 'response.cancelled':
          this.currentResponseId = null;
          console.log('[OPENAI-RT] ⏹ response.cancelled');
          this.emit('response_cancelled', event);
          break;

        case 'error': {
          const code = event?.error?.code;
          const param = event?.error?.param;
          const message = event?.error?.message || '';
          console.error(
            `[OPENAI-RT] ❌ API error: code=${code} param=${param} msg=${message}`
          );

          if (code === 'response_cancel_not_active') {
            this.currentResponseId = null;
            break;
          }
          if (
            code === 'invalid_value' &&
            (param === 'audio.audio' || param === 'audio' || param === 'session.audio')
          ) {
            console.warn('[OPENAI-RT] ⚠️ Invalid audio chunk — clearing buffer');
            try {
              this._send({ type: 'input_audio_buffer.clear' });
            } catch (_) {}
            break;
          }
          if (code === 'beta_api_shape_disabled') {
            console.error(
              '[OPENAI-RT] ❌ Beta API disabled — use session.type=realtime (GA)'
            );
          }
          this.emit('api_error', event);
          break;
        }

        default:
          if (VERBOSE) {
            console.log(`[OPENAI-RT] (unhandled) ${event.type}`);
          }
          break;
      }
    });

    this.ws.on('error', (err) => {
      console.error('[OPENAI-RT] ❌ WebSocket error:', err.message);
      this.emit('ws_error', err);
    });

    this.ws.on('close', (code, reason) => {
      this.closed = true;
      this.isReady = false;
      const r = reason?.toString() || '';
      console.log(
        `[OPENAI-RT] 🔌 Closed — code=${code} reason=${r} ` +
        `sent=${this._audioBytesSent}B chunks=${this._audioChunksSent} ` +
        `dropped=${this._audioBytesDropped}B`
      );
      this.emit('closed', { code, reason: r });
    });
  }

  appendAudio(pcmBuffer) {
    if (!this.isReady || this.closed) {
      if (Buffer.isBuffer(pcmBuffer) && pcmBuffer.length > 0) {
        this._audioBytesDropped += pcmBuffer.length;
        if (
          this._audioBytesDropped === pcmBuffer.length ||
          this._audioBytesDropped % 96000 === 0
        ) {
          console.warn(
            `[OPENAI-RT] ⚠️ mic dropped (not ready) — ready=${this.isReady} ` +
            `closed=${this.closed} totalDropped=${this._audioBytesDropped}B`
          );
        }
      }
      return;
    }
    if (!Buffer.isBuffer(pcmBuffer)) return;
    if (pcmBuffer.length === 0 || pcmBuffer.length % 2 !== 0) return;
    const base64 = pcmBuffer.toString('base64');
    if (!base64) return;
    this._send({ type: 'input_audio_buffer.append', audio: base64 });
    this._audioBytesSent += pcmBuffer.length;
    this._audioChunksSent += 1;
    if (this._audioChunksSent === 1 || this._audioChunksSent % 25 === 0) {
      console.log(
        `[OPENAI-RT] 🎤 → OpenAI +${pcmBuffer.length}B ` +
        `(total=${this._audioBytesSent}B chunks=${this._audioChunksSent})`
      );
    }
  }

  addHistoryMessage(role, text) {
    if (!this.isReady || this.closed) return;
    if (!text || !text.trim()) return;
    this._send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role,
        content: [{ type: role === 'assistant' ? 'output_text' : 'input_text', text }],
      },
    });
  }

  createResponse(overrideInstructions = null) {
    if (!this.isReady || this.closed) return;
    console.log('[OPENAI-RT] 📤 response.create');
    const msg = {
      type: 'response.create',
      response: { output_modalities: ['text'] },
    };
    if (overrideInstructions) {
      msg.response.instructions = overrideInstructions;
    }
    this._send(msg);
  }

  cancelResponse() {
    if (!this.ws || this.closed) return;
    if (this.ws.readyState !== WebSocket.OPEN) return;
    if (!this.currentResponseId) return;
    this._send({ type: 'response.cancel' });
  }

  close() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.close();
      } catch (_) {}
    }
    this.closed = true;
    this.isReady = false;
    this.removeAllListeners();
  }

  _send(obj) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (obj.type !== 'input_audio_buffer.append') {
        console.warn(`[OPENAI-RT] ⚠️ send skipped (socket closed): ${obj.type}`);
      }
      return;
    }
    try {
      this.ws.send(JSON.stringify(obj));
    } catch (e) {
      console.error('[OPENAI-RT] ❌ send error:', e.message);
    }
  }
}

module.exports = OpenAIRealtimeSession;
