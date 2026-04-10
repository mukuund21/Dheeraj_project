const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const stripPassword = (order) => {
  if (!order) return null;
  if (order.user) {
    const { password, ...safeUser } = order.user;
    return { ...order, user: safeUser };
  }
  return order;
};

const createOrder = async (userId, fileId, quoteData, inputs) => {
  const orderId = require('../utils/order-id-gen').generateOrderId();

  const order = await prisma.order.create({
    data: {
      id: orderId,
      userId,
      status: 'Placed',
      totalPrice: quoteData.totalPrice,
      inputs: JSON.stringify(inputs),
      pricingSnapshot: JSON.stringify(quoteData),
      statusHistory: {
        create: { status: 'Placed' },
      },
    },
    include: {
      statusHistory: true,
      dxfFile: true,
      user: true,
    },
  });

  return stripPassword(order);
};

const updateOrderStatus = async (orderId, status) => {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      statusHistory: {
        create: { status },
      },
    },
    include: {
      statusHistory: true,
    },
  });

  return order;
};

const getOrderById = async (orderId, userId, isAdmin) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      statusHistory: true,
      dxfFile: true,
      user: true,
    },
  });

  if (!order) return null;
  if (!isAdmin && order.userId !== userId) return null;

  return stripPassword(order);
};

const getOrdersByUser = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      statusHistory: true,
      dxfFile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
};

const getAllOrders = async (filters = {}) => {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.userId) where.userId = filters.userId;

  const orders = await prisma.order.findMany({
    where,
    include: {
      statusHistory: true,
      dxfFile: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(stripPassword);
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
};