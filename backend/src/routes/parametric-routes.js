const express = require('express');
const verifyToken = require('../middleware/verify-token');
const { getParametricGeometry } = require('../controllers/parametric');

const router = express.Router();

router.post('/', verifyToken, getParametricGeometry);

module.exports = router;
