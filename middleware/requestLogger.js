const { createLogger } = require('../utils/logger');

const log = createLogger('HTTP');
const SLOW_REQUEST_MS = parseInt(process.env.SLOW_REQUEST_MS, 10) || 5000;

/**
 * İstek süresi ve durum kodu loglama (MindCoach [SLOW-REQUEST] deseni).
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const line = `${req.method} ${req.originalUrl || req.path} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      log.error(line);
    } else if (res.statusCode >= 400) {
      log.warn(line);
    } else if (duration >= SLOW_REQUEST_MS) {
      log.warn(`Slow request: ${line}`);
    } else if ((req.originalUrl || req.path) !== '/health') {
      log.info(line);
    }
  });

  next();
}

module.exports = requestLogger;
