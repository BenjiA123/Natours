const express = require('express');

const app = express();

const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require("./controllers/errorController")

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//CREATING MIDDLEWARE
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

app.all('*', (req, res, next) => {

  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server`,404)
  );
});

app.use(globalErrorHandler );

module.exports = app;
