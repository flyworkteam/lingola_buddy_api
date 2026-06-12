const { createLogger } = require('../utils/logger');

const log = createLogger('PANEL-AUTH');

/**
 * Panel istekleri — header: X-Panel-Api-Key
 * .env: PANEL_API_KEY
 */
function panelAuth(req, res, next) {
  const expected = process.env.PANEL_API_KEY?.trim();
  if (!expected) {
    log.error('PANEL_API_KEY tanımlı değil');
    return res.status(503).json({
      success: false,
      error: 'Panel API is not configured',
    });
  }

  const headerKey = req.headers['x-panel-api-key'];
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const key = headerKey || bearer;
  if (!key || key !== expected) {
    return res.status(401).json({
      contractVersion: '2',
      error: 'UNAUTHORIZED',
      message: 'Invalid panel API key',
    });
  }

  next();
}

module.exports = { panelAuth };
