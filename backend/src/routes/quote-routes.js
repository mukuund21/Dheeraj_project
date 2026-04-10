const express = require('express');
const verifyToken = require('../middleware/verify-token');
const { getQuote } = require('../controllers/quote');

const router = express.Router();

router.post('/', verifyToken, getQuote);

module.exports = router;
