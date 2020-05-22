const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION  Exiting...');
  console.log(err.name,err.message,err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );
// "mongodb://localhost:27017/natours"
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to database ');
  })
  .catch((err) => {
    console.log(err);
  });
console.log(process.env.NODE_ENV);
const port = process.env.PORT || 3000;
console.log(port);

const server = app.listen(port, () => {});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection  Exiting...');
  console.log(err.name);
  server.close(() => {
    process.exit(1);
  });
});
