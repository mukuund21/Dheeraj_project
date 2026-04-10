const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/api-response');

const prisma = new PrismaClient();

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return error(res, 'A valid email address is required', 400);
    }

    if (!password || password.length < 8) {
      return error(res, 'Password must be at least 8 characters', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return error(res, 'Email is already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = signToken(user);

    return success(res, { token, user: { id: user.id, email: user.email, role: user.role } }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return error(res, 'Invalid credentials', 401);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return error(res, 'Invalid credentials', 401);
    }

    const token = signToken(user);

    return success(res, { token, user: { id: user.id, email: user.email, role: user.role } }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
