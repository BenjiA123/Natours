const AppError = require('../utils/appError');

// Error handle functions
const handleJWTExpiredError = () =>
  new AppError(
    'Your token has expired. Please login again',
    401
  );

const handleCastJWTError = () =>
  new AppError('Invalid token please log in again', 401);

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(
    (el) => el.message
  );

  const message = `Invalid Input Data, ${errors.join(
    '. '
  )}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate key value ${value} please use another`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};




// Development error handler
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
// Production error handler
const sendErrorProd = (err, res) => {
  if (err.isOperationalError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error(`ERROR `, err);
    res.status(500).json({
      status: 'Error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Determine the environment and serve the right error
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);


  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError')
      error = handleCastErrorDB(error);
    if (err.code === 11000)
      error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError')
      error = handleCastJWTError();
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
