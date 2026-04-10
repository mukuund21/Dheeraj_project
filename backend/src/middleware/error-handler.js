const { error } = require('../utils/api-response');

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.status || err.statusCode || 500;

  // Never expose internal error details to client
  // Only show safe messages — stack traces and DB errors stay server-side
  const isOperational = err.isOperational === true;
  const message = isOperational ? err.message : 'Internal server error';

  return error(res, message, statusCode);
};

module.exports = errorMiddleware;
