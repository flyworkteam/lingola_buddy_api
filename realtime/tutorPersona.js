'use strict';

/**
 * Maps Lingola [Tutor] rows to the consultant-shaped object expected by voiceChatServerV2.
 */
function tutorToConsultantShape(tutor) {
  const name = tutor.name || tutor.id;
  const native = tutor.nativeLang || 'English';
  return {
    id: tutor.id,
    names: {
      en: name,
      tr: name,
      de: name,
      es: name,
      fr: name,
      it: name,
      pt: name,
      ru: name,
      ja: name,
      ko: name,
      zh: name,
      hi: name,
    },
    voiceId: tutor.voiceId,
    gender: (tutor.gender || '').toString().toLowerCase() || null,
    job: `${native} language tutor`,
    explanation: tutor.description || tutor.tagline || '',
    features: [native, 'conversation practice', 'pronunciation'].filter(Boolean),
    mainPrompt:
      `You are ${name}, a friendly ${native} language tutor on Lingola Buddy. ` +
      `Help the learner practice speaking ${native} through natural conversation. ` +
      `Correct mistakes gently, encourage them, and keep replies short (1-3 sentences) ` +
      `unless they ask for more detail. Stay in character as ${name}.`,
    persona: tutor.id,
    photoUrl: tutor.photoUrl,
    rivUrl: tutor.rivUrl,
  };
}

module.exports = { tutorToConsultantShape };
