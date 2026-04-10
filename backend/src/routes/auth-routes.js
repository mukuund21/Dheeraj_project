const express = require('express');
const { register, login } = require('../controllers/auth');
const { authLimiter } = require('../middleware/rate-limiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

module.exports = router;