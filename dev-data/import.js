const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
// eslint-disable-next-line node/no-extraneous-require
const Tour = require(",/../../models/tourModels");

dotenv.config({ path: "./config.env" });
// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );
// "mongodb://localhost:27017/natours"
mongoose
  .connect("mongodb://localhost:27017/natours", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.log(err);
  });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, "utf-8")
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("DATA LOADED");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("DATA DELETED");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
  console.log("SUCCESs")
} else if (process.argv[2] === "--delete") {
  deleteData();
}
