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
const parametricRoutes = require('./src/routes/parametric-routes');
const errorHandler = require('./src/middleware/error-handler');
const { generalLimiter } = require('./src/middleware/rate-limiter');

const prisma = new PrismaClient();
const app = express();

const ensureUploadDir = () => {
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

const registerMiddleware = () => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

  app.use(cors({
    origin: allowedOrigin === '*' ? '*' : allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json({ limit: '50kb' }));
  app.use(generalLimiter);
};

const registerRoutes = () => {
  app.use('/api/auth', authRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/quote', quoteRoutes);
  app.use('/api/order', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/parametric', parametricRoutes);
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.use(errorHandler);
};

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected');
  } catch (err) {
    console.log('❌ Prisma connection failed');
    console.log(err);
  }

  ensureUploadDir();
  registerMiddleware();
  registerRoutes();

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`CORS origin: ${process.env.ALLOWED_ORIGIN || '*'}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
