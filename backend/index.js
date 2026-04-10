require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./src/routes/auth-routes');
const uploadRoutes = require('./src/routes/upload-routes');
const quoteRoutes = require('./src/routes/quote-routes');
const orderRoutes = require('./src/routes/order-routes');
const adminRoutes = require('./src/routes/admin-routes');
const errorHandler = require('./src/middleware/error-handler');

const prisma = new PrismaClient();
const app = express();

const ensureUploadDir = () => {
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

const registerMiddleware = () => {
  app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
  app.use(express.json());
};

const registerRoutes = () => {
  app.use('/api/auth', authRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/quote', quoteRoutes);
  app.use('/api/order', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use(errorHandler);
};

const startServer = async () => {
  await prisma.$connect();

  ensureUploadDir();
  registerMiddleware();
  registerRoutes();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
