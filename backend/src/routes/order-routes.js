const express = require('express');
const verifyToken = require('../middleware/verify-token');
const { createOrder, getMyOrders, getOrder } = require('../controllers/orders');

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/my', verifyToken, getMyOrders);
router.get('/:id', verifyToken, getOrder);

module.exports = router;
