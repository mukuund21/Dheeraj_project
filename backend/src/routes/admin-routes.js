const express = require('express');
const verifyToken = require('../middleware/verify-token');
const verifyAdmin = require('../middleware/verify-admin');
const { getAllOrders, updateOrderStatus, getConfig, updateConfig } = require('../controllers/admin');

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/config', getConfig);
router.put('/config', updateConfig);

module.exports = router;
