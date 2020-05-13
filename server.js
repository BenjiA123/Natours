const dotenv = require('dotenv');
const mongoose = require('mongoose');

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

const port = process.env.PORT || 3000;
console.log(port)

app.listen(port, () => {});
