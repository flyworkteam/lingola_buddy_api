const mysql = require('mysql2/promise');
const { createLogger } = require('../utils/logger');
require('dotenv').config();

const log = createLogger('DATABASE');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'flywork1_lingolabuddy',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT, 10) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  // DATE sütunlarını 'YYYY-MM-DD' string olarak al (timezone kayması yok)
  dateStrings: ['DATE'],
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    log.info('MySQL bağlantısı OK');
    conn.release();
  } catch (err) {
    log.error('MySQL bağlantı hatası', err.message);
  }
}

testConnection();

module.exports = pool;
