'use strict';

const axios = require('axios');
const TutorRepository = require('../repositories/TutorRepository');

const TTS_MODEL = process.env.ELEVENLABS_VOICE_CHAT_MODEL || 'eleven_turbo_v2_5';
const MAX_CHARS = 600;

class ChatTutorVoiceService {
  static estimateDurationMs(text) {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1000, Math.min(120000, Math.round((words / 2.5) * 1000)));
  }

  static async synthesize(tutorId, text) {
    const trimmed = (text || '').trim();
    if (!trimmed) {
      const err = new Error('Text is required');
      err.statusCode = 400;
      throw err;
    }
    if (trimmed.length > MAX_CHARS) {
      const err = new Error('Text too long for voice synthesis');
      err.statusCode = 400;
      throw err;
    }

    const tutor = await TutorRepository.findById(tutorId, { includeInactive: true });
    const voiceId = tutor?.voice_id;
    if (!voiceId) {
      const err = new Error('Tutor voice not configured');
      err.statusCode = 404;
      throw err;
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      const err = new Error('Voice synthesis unavailable');
      err.statusCode = 503;
      throw err;
    }

    const url =
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}` +
      `?output_format=mp3_44100_128`;

    let response;
    try {
      response = await axios.post(
        url,
        {
          text: trimmed,
          model_id: TTS_MODEL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.82,
            style: 0.18,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
          timeout: 45000,
          maxContentLength: 8 * 1024 * 1024,
        }
      );
    } catch (e) {
      const status = e.response?.status;
      const err = new Error(
        `ElevenLabs TTS failed${status ? ` (${status})` : ''}`
      );
      err.statusCode = status && status >= 400 && status < 600 ? status : 502;
      throw err;
    }

    const buffer = Buffer.from(response.data || []);
    if (!buffer.length) {
      const err = new Error('Empty audio response');
      err.statusCode = 502;
      throw err;
    }

    return {
      audioBase64: buffer.toString('base64'),
      mimeType: 'audio/mpeg',
      durationMs: this.estimateDurationMs(trimmed),
    };
  }
}

module.exports = ChatTutorVoiceService;
