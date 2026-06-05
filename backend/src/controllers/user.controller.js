const pool = require('../config/db');

const getStores = async (req, res) => {
  const { name, address, sortBy = 'name', order = 'asc' } = req.query;
  const userId = req.user.id;

  const validCols = ['name', 'address', 'avg_rating'];
  const col = validCols.includes(sortBy) ? sortBy : 'name';
  const dir = order === 'desc' ? 'DESC' : 'ASC';

  const conditions = [];
  const values = [userId];
  let i = 2;

  if (name)    { conditions.push(`s.name ILIKE $${i++}`);    values.push(`%${name}%`);    }
  if (address) { conditions.push(`s.address ILIKE $${i++}`); values.push(`%${address}%`); }

  const extra = conditions.length ? 'AND ' + conditions.join(' AND ') : '';

  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.address,
              ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
              MAX(CASE WHEN r.user_id = $1 THEN r.rating END) AS user_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE TRUE ${extra}
       GROUP BY s.id
       ORDER BY ${col === 'avg_rating' ? 'avg_rating' : 's.' + col} ${dir} NULLS LAST`,
      values
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stores' });
  }
};

const submitRating = async (req, res) => {
  const { store_id, rating } = req.body;
  const userId = req.user.id;

  if (!store_id || !rating) {
    return res.status(400).json({ error: 'store_id and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const store = await pool.query('SELECT id FROM stores WHERE id = $1', [store_id]);
    if (!store.rows.length) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const { rows } = await pool.query(
      `INSERT INTO ratings (store_id, user_id, rating)
       VALUES ($1, $2, $3) RETURNING *`,
      [store_id, userId, rating]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already rated this store, use update instead' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

const updateRating = async (req, res) => {
  const { storeId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE ratings SET rating = $1
       WHERE store_id = $2 AND user_id = $3
       RETURNING *`,
      [rating, storeId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'No rating found to update' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update rating' });
  }
};

module.exports = { getStores, submitRating, updateRating };
