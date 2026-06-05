require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: npm run create-admin <email> <password>');
  process.exit(1);
}

const email = args[0];
const password = args[1];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.error('Error: A user with this email already exists.');
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'admin')`,
      ['System Administrator', email, hash, 'Admin Address']
    );
    console.log(`✅ Admin account successfully created for ${email}`);
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await pool.end();
  }
}

run();
