const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('db connected');
});

pool.on('error', (err) => {
  console.error('db error', err);
  process.exit(-1);
});

module.exports = pool;
