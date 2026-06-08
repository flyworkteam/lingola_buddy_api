/**
 * tutors tablosunu oluşturur ve seed verilerini yükler.
 * Kullanım: node scripts/apply_tutors.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'flywork1_lingolabuddy',
    multipleStatements: true,
  });

  const createSql = fs.readFileSync(
    path.join(__dirname, 'create_tutors_table.sql'),
    'utf8'
  );
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed_tutors.sql'), 'utf8');

  await conn.query(createSql);
  await conn.query(seedSql);
  await conn.end();
  console.log('✅ tutors tablosu ve seed verileri uygulandı');
}

run().catch((err) => {
  console.error('❌ apply_tutors failed:', err.message);
  process.exit(1);
});
