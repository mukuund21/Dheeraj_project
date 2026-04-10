const { getAllOrders: getAllOrdersService, updateOrderStatus: updateOrderStatusService } = require('../services/order-handler');
const { success, error } = require('../utils/api-response');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ALLOWED_STATUSES = ['Placed', 'Confirmed', 'Cutting', 'Bending', 'Finishing', 'Shipped', 'Delivered'];

const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const allOrders = await getAllOrdersService(filters);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const start = (pageNum - 1) * limitNum;
    const paginated = allOrders.slice(start, start + limitNum);

    return success(res, {
      orders: paginated,
      total: allOrders.length,
      page: pageNum,
      limit: limitNum,
    }, 'Orders retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return error(res, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`, 400);
    }

    const order = await updateOrderStatusService(id, status);
    return success(res, order, 'Order status updated successfully');
  } catch (err) {
    next(err);
  }
};

const getConfig = async (req, res, next) => {
  try {
    const config = await prisma.pricingConfig.findMany();
    return success(res, config, 'Pricing config retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const updateConfig = async (req, res, next) => {
  try {
    const { key, value } = req.body;

    if (!key || value == null) {
      return error(res, 'Missing required fields: key, value', 400);
    }

    const config = await prisma.pricingConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    return success(res, config, 'Pricing config updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllOrders, updateOrderStatus, getConfig, updateConfig };
