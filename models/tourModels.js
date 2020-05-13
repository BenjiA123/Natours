const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pleas fill in a Name'],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Please add a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Please add a Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Please add a difficulty'],
    },
    ratingAverage: {
      type: Number,
      required: false,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number,
      required: false,
      default: 0,
    },
    price: {
      type: String,
      required: [true, 'Pleas fill in a Price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      required: [true, 'Please write a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Please write a summary'],
      trim: true,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Middleware for .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE FOR NON SECREAT TOURS

// tourSchema.pre('find', function (next) {

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `Query took ${Date.now() - this.start} milliseconds`
  );
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

// https://github.com/BenjiA123/Natours.git
