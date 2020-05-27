const Review = require('../models/reviewsModel');
const catchAsync = require('../utils/catchAsync')


exports.getAllReviews = async (req, res, next) => {
  const reviews = await Review.find();
  const result = await Review.countDocuments()
  res.status(200).json({
    status: 'success',
    result,
    data:{
        reviews
    },
  });
};

exports.createReview = catchAsync( async (req, res, next) => {
  const newReviews = await Review.create(req.body);
  res.status(201).json({
      status:'success',
      data:{
        review:newReviews
      }
  })
})

