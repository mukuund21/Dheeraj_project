const express = require('express');
const verifyToken = require('../middleware/verify-token');
const multerConfig = require('../middleware/multer-config');
const { uploadFile } = require('../controllers/upload');
const { uploadLimiter } = require('../middleware/rate-limiter');

const router = express.Router();

router.post('/', verifyToken, uploadLimiter, multerConfig, uploadFile);

module.exports = router;