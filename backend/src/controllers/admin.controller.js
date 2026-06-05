const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const getStats = async (req, res) => {
  try {
    const users   = await pool.query('SELECT COUNT(*) FROM users');
    const stores  = await pool.query('SELECT COUNT(*) FROM stores');
    const ratings = await pool.query('SELECT COUNT(*) FROM ratings');

    res.json({
      totalUsers:   parseInt(users.rows[0].count),
      totalStores:  parseInt(stores.rows[0].count),
      totalRatings: parseInt(ratings.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

const getUsers = async (req, res) => {
  const { name, email, address, role, sortBy = 'name', order = 'asc' } = req.query;

  const validCols = ['name', 'email', 'address', 'role', 'created_at'];
  const col = validCols.includes(sortBy) ? sortBy : 'name';
  const dir = order === 'desc' ? 'DESC' : 'ASC';

  const conditions = [];
  const values = [];
  let i = 1;

  if (name)    { conditions.push(`u.name ILIKE $${i++}`);    values.push(`%${name}%`);    }
  if (email)   { conditions.push(`u.email ILIKE $${i++}`);   values.push(`%${email}%`);   }
  if (address) { conditions.push(`u.address ILIKE $${i++}`); values.push(`%${address}%`); }
  if (role)    { conditions.push(`u.role = $${i++}`);        values.push(role);            }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at
       FROM users u ${where}
       ORDER BY u.${col} ${dir}`,
      values
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role,
              ROUND(AVG(r.rating)::numeric, 2) AS store_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const addUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !address || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (name.length > 60) {
    return res.status(400).json({ error: 'Name cannot exceed 60 characters' });
  }

  if (address.length > 400) {
    return res.status(400).json({ error: 'Address is too long' });
  }

  if (!pwRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be 8-16 characters with at least one uppercase and one special character',
    });
  }

  if (!['admin', 'user', 'owner'].includes(role)) {
    return res.status(400).json({ error: 'Role is not valid' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
      email.trim().toLowerCase(),
    ]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name.trim(), email.trim().toLowerCase(), hash, address.trim(), role]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const getStores = async (req, res) => {
  const { name, email, address, sortBy = 'name', order = 'asc' } = req.query;

  const validCols = ['name', 'email', 'address', 'avg_rating', 'created_at'];
  const col = validCols.includes(sortBy) ? sortBy : 'name';
  const dir = order === 'desc' ? 'DESC' : 'ASC';

  const conditions = [];
  const values = [];
  let i = 1;

  if (name)    { conditions.push(`s.name ILIKE $${i++}`);    values.push(`%${name}%`);    }
  if (email)   { conditions.push(`s.email ILIKE $${i++}`);   values.push(`%${email}%`);   }
  if (address) { conditions.push(`s.address ILIKE $${i++}`); values.push(`%${address}%`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
              ROUND(AVG(r.rating)::numeric, 2) AS avg_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       ${where}
       GROUP BY s.id
       ORDER BY ${col === 'avg_rating' ? 'avg_rating' : 's.' + col} ${dir} NULLS LAST`,
      values
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

const addStore = async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  if (!name || !email || !address) {
    return res.status(400).json({ error: 'Name, email and address are required' });
  }

  if (address.length > 400) {
    return res.status(400).json({ error: 'Address is too long' });
  }

  try {
    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [
      email.trim().toLowerCase(),
    ]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A store with this email already exists' });
    }

    const { rows } = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), email.trim().toLowerCase(), address.trim(), owner_id || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create store' });
  }
};

module.exports = { getStats, getUsers, getUserById, addUser, getStores, addStore };
