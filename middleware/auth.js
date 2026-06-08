const jwt = require('jsonwebtoken');
const UserService = require('../services/userService');
const TokenRepository = require('../repositories/TokenRepository');
const { createLogger } = require('../utils/logger');

const log = createLogger('AUTH');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token gerekli' });
    }

    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: 'Geçersiz veya süresi dolmuş token' });
    }

    const valid = await TokenRepository.isValid(token);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Token iptal edilmiş' });
    }

    const user = await UserService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    log.error('Auth middleware failure', err);
    res.status(500).json({ success: false, error: 'Kimlik doğrulama hatası' });
  }
}

module.exports = { authenticate };
