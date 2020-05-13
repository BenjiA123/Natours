/* eslint-disable prettier/prettier */
const express = require("express");

const app = express();
// eslint-disable-next-line prettier/prettier
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const tourRouter = require("./routes/tourRoutes");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//CREATING MIDDLEWARE
app.use((req, res, next) => {
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);

module.exports = app;
