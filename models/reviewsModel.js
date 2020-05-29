const mongoose = require('mongoose');

const Tour = require("./tourModels")

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must have a User'],
      },
    ],
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must have a Tour'],
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


reviewSchema.statics.calcAverageRatings = async function(tourId){
  const stats = await this.aggregate([
    {
      $match:{tour:tourId}
    },
    {
      $group:{
        _id:'$tour',
        nRating:{$sum:1},
        avgRating:{$avg:'$rating'}
      }
    }
  ])
  console.log(stats)
  if(stats.length >0){
    await Tour.findByIdAndUpdate(tourId,{
      ratingQuantity:stats[0].nRating,
      ratingAverage:stats[0].avgRating
    })
    
  }else{
    await Tour.findByIdAndUpdate(tourId,{
      ratingQuantity:0,
      ratingAverage:4.5
    })

  }
}

reviewSchema.post('save',function(){

  this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });

  this.populate({
    path: 'user',
    select: ' name photo',
  });

  next();
});

reviewSchema.pre(/^findOneAnd/, async function(next){
  // this.r is the declaration and storing of a new property
  this.r = await this.findOne()
  next()
})

reviewSchema.post(/^findOneAnd/,async function(next){

  // findOne() does not work here because the query has already been executed
  await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
