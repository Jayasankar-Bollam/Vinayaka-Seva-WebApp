// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register,login, forgotPassword, resetPassword, updateLogo,updateBackground, getMe } = require('../controllers/authController');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');



router.post('/register', upload.single('logo'), register);

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/update-logo', requireAuth, upload.single('logo'), updateLogo);
router.put('/update-background', requireAuth, upload.single('background'), updateBackground);
router.get('/me', requireAuth, getMe);
module.exports = router;