const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel')
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pleas fill in a Name'],
      unique: true,
      trim: true,
      maxlength: [40, "Tours can't be more than 40 characters"],
      minlength: [10, "Tours can't be less than 10 characters"],
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
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingAverage: {
      type: Number,
      required: false,
      default: 4.5,
      min: [1, 'Rating should be more than 1'],
      max: [5, 'Rating should be less than 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      required: false,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Pleas fill in a Price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc on new doc creation
          return val < this.price;
        },
        message: 'The discout price ({VALUE}) can not be more than the price',
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
      required: [true, 'A tour must have a cover Image'],
      trim: true,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },

        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// tourSchema.index({price:1})
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: '2dsphere' });
// tourSchema.index({ distance: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Middleware for .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save',async function(next){
//   const guidesPromises = this.guides.map(async id => await User.findById(id))
//   this.guides = await Promise.all(guidesPromises)
//   next()
// })
// QUERY MIDDLEWARE FOR NON SECREAT TOURS

// Permits middleware to work for all "find" calls such as findOne,findMany

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
// geoNear aggregation pipeline needs to be the first
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

// https://github.com/BenjiA123/Natours.git
