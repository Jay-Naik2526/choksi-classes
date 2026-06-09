const express = require('express');
const router = express.Router();
const { login, forgotPassword, resetPassword, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, changePassword);

module.exports = router;