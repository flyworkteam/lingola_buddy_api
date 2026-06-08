const pool = require('../config/database');
const { executeWithRetry } = require('../utils/dbRetry');

class TutorTranslationRepository {
  static async findForTutorIds(tutorIds, locale) {
    if (!tutorIds.length) return new Map();
    const placeholders = tutorIds.map(() => '?').join(',');
    const [rows] = await executeWithRetry(
      () =>
        pool.execute(
          `SELECT tutor_id, locale, display_name, description, tagline
           FROM tutor_translations
           WHERE tutor_id IN (${placeholders}) AND locale = ?`,
          [...tutorIds, locale]
        ),
      2,
      'TutorTranslationRepository.findForTutorIds'
    );
    const map = new Map();
    for (const row of rows) {
      map.set(row.tutor_id, row);
    }
    return map;
  }

  static async findAllForTutor(tutorId) {
    const [rows] = await executeWithRetry(
      () =>
        pool.execute(
          `SELECT locale, display_name, description, tagline
           FROM tutor_translations WHERE tutor_id = ? ORDER BY locale ASC`,
          [tutorId]
        ),
      2,
      'TutorTranslationRepository.findAllForTutor'
    );
    return rows;
  }

  static async upsertMany(tutorId, translations) {
    if (!translations || typeof translations !== 'object') return;
    const entries = Object.entries(translations);
    for (const [locale, value] of entries) {
      if (!value || typeof value !== 'object') continue;
      const displayName = String(value.displayName || value.name || '').trim();
      const description = String(value.description || '').trim();
      const tagline = value.tagline != null ? String(value.tagline).trim() : null;
      if (!displayName || !description) continue;

      await executeWithRetry(
        () =>
          pool.execute(
            `INSERT INTO tutor_translations
              (tutor_id, locale, display_name, description, tagline)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               display_name = VALUES(display_name),
               description = VALUES(description),
               tagline = VALUES(tagline)`,
            [tutorId, locale, displayName, description, tagline]
          ),
        2,
        'TutorTranslationRepository.upsertMany'
      );
    }
  }

  static async deleteForTutor(tutorId) {
    await executeWithRetry(
      () => pool.execute('DELETE FROM tutor_translations WHERE tutor_id = ?', [tutorId]),
      2,
      'TutorTranslationRepository.deleteForTutor'
    );
  }
}

module.exports = TutorTranslationRepository;
