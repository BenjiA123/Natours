const Tour = require('../models/tourModels');

const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory')

// Sort Top 5 tours middle ware with  -ratingAverage,price and firlds name,price,ratingAverage,summary,difficulty
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields =
    'name,price,ratingAverage,summary,difficulty';
  console.log(req.query.limit);
  next();
};

exports.getAllTours =factory.getAll(Tour)
exports.getTour =  factory.getOne(Tour,{path:'reviews'})

// Tale care of req.body in case of security. Do not send your whole req.body to client
exports.createTour = factory.createOne(Tour)

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour =factory.deleteOne(Tour);
// Manipulating tours stats
exports.getToursStats = catchAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 0.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingQuantity' },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
      // {$match: { _id: { $ne: 'EASY' } },}
    ]);
    res.status(201).json({
      status: 'success',
      stats,
    });
  }
);

// Manipulating the stats for monthly fetched data
exports.getMonthlyPlan = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1; //2021

    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);
    res.status(201).json({
      status: 'success',
      plan,
    });
  }
);
