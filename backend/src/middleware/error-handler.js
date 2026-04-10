const { error } = require('../utils/api-response');

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  const details = process.env.NODE_ENV !== 'production' ? err.stack : undefined;

  return error(res, message, statusCode, details);
};

module.exports = errorMiddleware;
