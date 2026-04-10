const express = require('express');
const verifyToken = require('../middleware/verify-token');
const { getQuote, getParametricQuote } = require('../controllers/quote');
const router = express.Router();

router.post('/', verifyToken, getQuote);
router.post('/parametric', verifyToken, getParametricQuote);

module.exports = router;
