const { PrismaClient } = require('@prisma/client');
const { createOrder: createOrderService, getOrderById, getOrdersByUser } = require('../services/order-handler');
const { sendOrderConfirmation } = require('../services/mailer');
const { getPendingUpload, deletePendingUpload } = require('../utils/upload-store');
const { success, error } = require('../utils/api-response');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const createOrder = async (req, res, next) => {
  try {
    const { fileId, quoteData, inputs } = req.body;

    if (!fileId || !quoteData || !inputs) {
      return error(res, 'Missing required fields: fileId, quoteData, inputs', 400);
    }

    const pending = getPendingUpload(fileId);
    if (!pending) {
      return error(res, 'Uploaded file not found. Please upload your DXF file again.', 404);
    }

    const order = await createOrderService(req.user.id, fileId, quoteData, inputs);

    await prisma.dXFFile.create({
      data: {
        id: uuidv4(),
        orderId: order.id,
        filename: pending.filename,
        originalName: pending.originalName,
        perimeter: pending.geometry.perimeter,
        boundingBoxWidth: pending.geometry.boundingBoxWidth,
        boundingBoxHeight: pending.geometry.boundingBoxHeight,
        entityCount: pending.geometry.entityCount,
      },
    });

    deletePendingUpload(fileId);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    await sendOrderConfirmation(user, order);

    return success(res, { orderId: order.id, order }, 'Order created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    const order = await getOrderById(id, req.user.id, isAdmin);
    if (!order) {
      return error(res, 'Order not found or access denied', 404);
    }

    return success(res, order, 'Order retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await getOrdersByUser(req.user.id);
    return success(res, orders, 'Orders retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrder, getMyOrders };
