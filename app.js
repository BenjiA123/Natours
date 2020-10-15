const express = require('express');
const path = require('path');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(`${__dirname}/public`));

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
  message: 'Too many Requests from this IP Address please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser());

// Permiting other people to access our entire API add it as a single middleware to individual
// Routes if you want that
// This only works for simple requests GET and POST
app.use(cors());
// Adding Options
// app.use(cors({
//   origin:''
// }))
// Non Simple requests
app.options('*', cors());
// Adding Options
// app.options(cors({
//   origin:''
// }))

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

// Test middlewares
app.use((req, res, next) => {
  next();
});

app.use((req, res, next) => {
  // console.log(req.headers)
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
