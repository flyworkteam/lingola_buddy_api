const { createLogger } = require('./logger');

const log = createLogger('DB-RETRY');

/**
 * Veritabanı işlemleri için yeniden deneme (MindCoach API deseni).
 */
async function executeWithRetry(queryFn, retries = 2, operationName = 'Database operation') {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      const isRetryableError =
        error.code === 'ECONNRESET' ||
        error.code === 'PROTOCOL_CONNECTION_LOST' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'PROTOCOL_ENQUEUE_AFTER_QUIT' ||
        (error.message && error.message.includes('Connection lost'));

      if (isRetryableError && attempt < retries) {
        const delay = Math.min(200 * (attempt + 1), 2000);
        log.warn(
          `${operationName} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`,
          error.code || error.message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      log.error(`${operationName} failed after ${attempt + 1} attempt(s)`, error);
      throw error;
    }
  }
}

module.exports = { executeWithRetry };
