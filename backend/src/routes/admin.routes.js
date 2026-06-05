const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  getUserById,
  addUser,
  getStores,
  addStore,
} = require('../controllers/admin.controller');

// All admin routes require auth + admin role
router.use(authenticate, authorize('admin'));

router.get('/stats',        getStats);
router.get('/users',        getUsers);
router.post('/users',       addUser);
router.get('/users/:id',    getUserById);
router.get('/stores',       getStores);
router.post('/stores',      addStore);

module.exports = router;
