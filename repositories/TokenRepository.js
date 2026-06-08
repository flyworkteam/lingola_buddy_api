const pool = require('../config/database');
const crypto = require('crypto');

class TokenRepository {
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async create(userId, token, expiresAt, options = {}) {
    const tokenHash = this.hashToken(token);
    await pool.execute(
      `INSERT INTO user_tokens (user_id, token, token_hash, expires_at, device_info, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        token,
        tokenHash,
        expiresAt,
        options.deviceInfo ?? null,
        options.ipAddress ?? null,
      ]
    );
  }

  static async isValid(token) {
    const tokenHash = this.hashToken(token);
    const [rows] = await pool.execute(
      `SELECT id FROM user_tokens
       WHERE token_hash = ? AND is_revoked = 0 AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );
    return rows.length > 0;
  }

  static async revoke(token) {
    const tokenHash = this.hashToken(token);
    const [result] = await pool.execute(
      'UPDATE user_tokens SET is_revoked = 1 WHERE token_hash = ? AND is_revoked = 0',
      [tokenHash]
    );
    return result.affectedRows > 0;
  }

  static async revokeAll(userId) {
    const [result] = await pool.execute(
      'UPDATE user_tokens SET is_revoked = 1 WHERE user_id = ? AND is_revoked = 0',
      [userId]
    );
    return result.affectedRows;
  }
}

module.exports = TokenRepository;
