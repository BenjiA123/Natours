const Tour = require('../models/tourModels');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// exports.getTours = catchAsync(async (req, res, next) => {
//   res.status(200).render('tour', {
//     title: 'The forest  ',
//   });
// });
exports.getOverView = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.login = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into You Account',
  });
};

exports.getAccount = (req, res, next) => {
  try {
    res.status(200).render('account', {
      title: 'Your Account',
    });
  } catch (error) {}
};
