const CONTRACT_VERSION = '2';

function toIso(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseCredentialEmail(credentialData) {
  if (!credentialData) return null;
  const data =
    typeof credentialData === 'string'
      ? (() => {
          try {
            return JSON.parse(credentialData);
          } catch {
            return null;
          }
        })()
      : credentialData;
  return data?.email || null;
}

function mapPanelUser(row) {
  const email = parseCredentialEmail(row.credential_data);
  return {
    id: String(row.id),
    email,
    displayName: row.username || email || `Kullanıcı #${row.id}`,
    phone: null,
    status: 'active',
    createdAt: toIso(row.account_created_date),
    lastLoginAt: toIso(row.last_token_at),
    extras: {
      authProvider: row.credential || null,
      profilePhotoUrl: row.profile_photo_url ?? null,
      isPremium: Boolean(row.is_premium),
      streakDays: Number(row.streak_days || 0),
      totalPracticeMinutes: Number(row.total_practice_minutes || 0),
      wordsLearnedCount: Number(row.words_learned_count || 0),
      accuracyPercent:
        row.accuracy_percent == null ? null : Number(row.accuracy_percent),
      practiceDaysCount: Number(row.practice_days_count || 0),
      conversationCount: Number(row.conversation_count || 0),
      messageCount: Number(row.message_count || 0),
    },
  };
}

function mapPanelTutor(tutor, translations = []) {
  const trMap = {};
  translations.forEach((t) => {
    trMap[t.locale] = {
      displayName: t.displayName ?? t.display_name ?? null,
      description: t.description ?? null,
      tagline: t.tagline ?? null,
    };
  });

  const isActive = tutor.isActive !== false && tutor.is_active !== 0;
  return {
    id: String(tutor.id),
    title: tutor.name,
    description: tutor.description ?? null,
    status: isActive ? 'published' : 'archived',
    category: tutor.gender ?? null,
    coverImageUrl: tutor.photoUrl ?? tutor.photo_url ?? null,
    createdAt: toIso(tutor.created_at),
    updatedAt: toIso(tutor.updated_at),
    extras: {
      voiceId: tutor.voiceId ?? tutor.voice_id ?? null,
      rivUrl: tutor.rivUrl ?? tutor.riv_url ?? null,
      nativeLang: tutor.nativeLang ?? tutor.native_lang ?? null,
      tagline: tutor.tagline ?? null,
      sortOrder: tutor.sortOrder ?? tutor.sort_order ?? 0,
      localizedTitles: Object.fromEntries(
        Object.entries(trMap).map(([locale, v]) => [locale, v.displayName])
      ),
      localizedDescriptions: Object.fromEntries(
        Object.entries(trMap).map(([locale, v]) => [locale, v.description])
      ),
      localizedTaglines: Object.fromEntries(
        Object.entries(trMap).map(([locale, v]) => [locale, v.tagline])
      ),
      translations: trMap,
    },
  };
}

function paginationMeta(page, limit, total) {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = {
  CONTRACT_VERSION,
  toIso,
  mapPanelUser,
  mapPanelTutor,
  paginationMeta,
};
