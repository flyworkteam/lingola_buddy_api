const pool = require('../config/database');
const { executeWithRetry } = require('../utils/dbRetry');

class UserRepository {
  static async findByCredential(credential, providerId) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        `SELECT * FROM users
         WHERE credential = ?
         AND JSON_UNQUOTE(JSON_EXTRACT(credential_data, '$.id')) = ?
         LIMIT 1`,
        [credential, providerId]
      );
      return rows[0] ?? null;
    });
  }

  static async findById(id) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      return rows[0] ?? null;
    });
  }

  static async create(userData) {
    return executeWithRetry(async () => {
      const [result] = await pool.execute(
        `INSERT INTO users (
          credential, credential_data, username, native_lang,
          profile_photo_url, learn_language_code, proficiency, daily_goal,
          account_created_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.credential,
          JSON.stringify(userData.credentialData),
          userData.username,
          userData.nativeLang ?? null,
          userData.profilePhotoUrl ?? null,
          userData.learnLanguageCode ?? null,
          userData.proficiency ?? null,
          userData.dailyGoal ?? null,
          userData.accountCreatedDate ?? new Date(),
        ]
      );
      return this.findById(result.insertId);
    });
  }

  static async update(id, userData) {
    return executeWithRetry(async () => {
      const fields = [];
      const values = [];

      const map = {
        credential: 'credential',
        credentialData: ['credential_data', (v) => JSON.stringify(v)],
        username: 'username',
        nativeLang: 'native_lang',
        profilePhotoUrl: 'profile_photo_url',
        learnLanguageCode: 'learn_language_code',
        proficiency: 'proficiency',
        dailyGoal: 'daily_goal',
        currentLessonId: 'current_lesson_id',
      };

      for (const [key, col] of Object.entries(map)) {
        if (userData[key] === undefined) continue;
        if (Array.isArray(col)) {
          fields.push(`${col[0]} = ?`);
          values.push(col[1](userData[key]));
        } else {
          fields.push(`${col} = ?`);
          values.push(userData[key]);
        }
      }

      if (fields.length === 0) return this.findById(id);

      values.push(id);
      await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
      return this.findById(id);
    });
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static mapRowToUser(row) {
    const credentialData =
      typeof row.credential_data === 'string'
        ? JSON.parse(row.credential_data)
        : row.credential_data;

    return {
      id: row.id,
      credential: row.credential,
      credentialData,
      username: row.username,
      nativeLang: row.native_lang,
      profilePhotoUrl: row.profile_photo_url,
      learnLanguageCode: row.learn_language_code,
      proficiency: row.proficiency,
      dailyGoal: row.daily_goal,
      current_lesson_id: row.current_lesson_id,
      accountCreatedDate: row.account_created_date
        ? new Date(row.account_created_date).toISOString()
        : null,
    };
  }
}

module.exports = UserRepository;
