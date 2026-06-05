const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboard } = require('../controllers/owner.controller');

router.use(authenticate, authorize('owner'));

router.get('/dashboard', getDashboard);

module.exports = router;
