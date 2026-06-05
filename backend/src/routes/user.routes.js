const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getStores, submitRating, updateRating } = require('../controllers/user.controller');

router.use(authenticate, authorize('user'));

router.get('/stores',             getStores);
router.post('/ratings',           submitRating);
router.put('/ratings/:storeId',   updateRating);

module.exports = router;
