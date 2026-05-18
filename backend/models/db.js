const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'localhost',
  port:            parseInt(process.env.DB_PORT) || 3306,
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME     || 'chaitanya_framemakers',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit:      0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+05:30',
  charset: 'utf8mb4',
});

pool.getConnection()
  .then(conn => { console.log('✅ MySQL connected'); conn.release(); })
  .catch(err => { console.error('❌ MySQL error:', err.message); });

module.exports = pool;
