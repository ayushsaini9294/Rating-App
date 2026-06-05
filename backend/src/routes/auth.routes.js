const router = require('express').Router();
const { login, signup, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

router.post('/login',           login);
router.post('/signup',          signup);
router.put('/change-password',  authenticate, changePassword);

module.exports = router;
