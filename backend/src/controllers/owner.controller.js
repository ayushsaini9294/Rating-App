const pool = require('../config/db');

const getDashboard = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const storeRes = await pool.query(
      'SELECT id, name, address FROM stores WHERE owner_id = $1',
      [ownerId]
    );

    if (!storeRes.rows.length) {
      return res.json({ store: null, avgRating: null, raters: [] });
    }

    const store = storeRes.rows[0];

    const avgRes = await pool.query(
      'SELECT ROUND(AVG(rating)::numeric, 2) AS avg FROM ratings WHERE store_id = $1',
      [store.id]
    );

    const ratersRes = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    res.json({
      store,
      avgRating: avgRes.rows[0].avg,
      raters: ratersRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

module.exports = { getDashboard };
