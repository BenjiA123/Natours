const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pleas fill in a Name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "Tours can't be more than 40 characters",
      ],
      minlength: [
        10,
        "Tours can't be less than 10 characters",
      ],
      // validate:[validator.isAlpha,"Tour name must only contain letters"]
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
      enum: {
        values: ['easy', 'medium', 'difficuly'],
        message:
          'Difficulty is either easy, medium or difficult',
      },
    },
    ratingAverage: {
      type: Number,
      required: false,
      default: 4.5,
      min: [1, 'Rating should be more than 1'],
      max: [5, 'Rating should be less than 5.0'],
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
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc on new doc creation
          return val < this.price;
        },
        message:
          'The discout price ({VALUE}) can not be more than the price',
      },
    },
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

// Permits middleware to work for all "find" calls such as findOne,findMany

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
