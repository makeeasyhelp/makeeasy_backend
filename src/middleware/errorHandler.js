/**
 * Custom error handler middleware
 * @param {Object} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  console.error('\n❌❌❌ ERROR HANDLER CALLED ❌❌❌');
  console.error(`Path: ${req.method} ${req.path}`);
  console.error(`Error name: ${err.name}`);
  console.error(`Error message: ${err.message}`);
  console.error(`Error status: ${err.statusCode || 500}`);
  console.error(`Error stack:\n${err.stack}`);

  // Create error response object
  const error = {
    success: false,
    error: err.message || 'Server Error',
    statusCode: err.statusCode || 500
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = `Resource not found with id of ${err.value}`;
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token. Please log in again.';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Your token has expired. Please log in again.';
    error.statusCode = 401;
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
