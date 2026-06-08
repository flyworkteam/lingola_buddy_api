const pool = require('../config/database');
const { executeWithRetry } = require('../utils/dbRetry');

class TutorRepository {
  static async findAllActive() {
    return executeWithRetry(
      async () => {
        const [rows] = await pool.execute(
          `SELECT * FROM tutors
           WHERE is_active = 1
           ORDER BY sort_order ASC, name ASC`
        );
        return rows;
      },
      2,
      'TutorRepository.findAllActive'
    );
  }

  static async findAll({ includeInactive = false } = {}) {
    return executeWithRetry(
      async () => {
        const where = includeInactive ? '' : 'WHERE is_active = 1';
        const [rows] = await pool.execute(
          `SELECT * FROM tutors ${where} ORDER BY sort_order ASC, name ASC`
        );
        return rows;
      },
      2,
      'TutorRepository.findAll'
    );
  }

  static async findById(id, { includeInactive = false } = {}) {
    return executeWithRetry(
      async () => {
        const activeClause = includeInactive ? '' : ' AND is_active = 1';
        const [rows] = await pool.execute(
          `SELECT * FROM tutors WHERE id = ?${activeClause} LIMIT 1`,
          [id]
        );
        return rows[0] ?? null;
      },
      2,
      'TutorRepository.findById'
    );
  }

  static async create(row) {
    await executeWithRetry(
      () =>
        pool.execute(
          `INSERT INTO tutors
            (id, name, description, gender, photo_url, riv_url, voice_id,
             native_lang, tagline, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.id,
            row.name,
            row.description,
            row.gender,
            row.photo_url,
            row.riv_url,
            row.voice_id,
            row.native_lang,
            row.tagline,
            row.sort_order,
            row.is_active,
          ]
        ),
      2,
      'TutorRepository.create'
    );
  }

  static async update(id, patch) {
    const fields = [];
    const values = [];
    const columnMap = {
      name: 'name',
      description: 'description',
      gender: 'gender',
      photoUrl: 'photo_url',
      rivUrl: 'riv_url',
      voiceId: 'voice_id',
      nativeLang: 'native_lang',
      tagline: 'tagline',
      sortOrder: 'sort_order',
      isActive: 'is_active',
    };

    for (const [key, col] of Object.entries(columnMap)) {
      if (patch[key] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(patch[key]);
      }
    }

    if (!fields.length) return;
    values.push(id);
    await executeWithRetry(
      () => pool.execute(`UPDATE tutors SET ${fields.join(', ')} WHERE id = ?`, values),
      2,
      'TutorRepository.update'
    );
  }

  static async softDelete(id) {
    await executeWithRetry(
      () => pool.execute('UPDATE tutors SET is_active = 0 WHERE id = ?', [id]),
      2,
      'TutorRepository.softDelete'
    );
  }
}

module.exports = TutorRepository;
