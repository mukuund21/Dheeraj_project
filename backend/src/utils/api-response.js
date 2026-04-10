const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
    details: null,
  });
};

const error = (res, message = 'An error occurred', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error: message,
    details,
  });
};

module.exports = { success, error };
