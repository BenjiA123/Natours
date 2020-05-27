const express = require('express');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//GLOBAL MIDDLEWARE
// Set security HTTPS
app.use(helmet());

// Document logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit req from  the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many Requests from this IP please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization agaist NoSQL query Injection
app.use(mongoSanitize());

// Data sanitization against Cross site scripting attacks (XXS)
app.use(xss());
// Serving static files

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantiy',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(express.static(`${__dirname}/public`));

// Test middlewares
app.use((req, res, next) => {
  next();
});

app.use((req, res, next) => {
  // console.log(req.headers)
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews',reviewRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
