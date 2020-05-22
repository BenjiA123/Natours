const Tour = require('../models/tourModels');
const APIFeatures = require('../utils/apiFeatures');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Sort Top 5 tours middle ware with  -ratingAverage,price and firlds name,price,ratingAverage,summary,difficulty
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields =
    'name,price,ratingAverage,summary,difficulty';
  console.log(req.query.limit);
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours },
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(
      new AppError(`No tour Found this with ID`, 404)
    );
  }
  res.status(201).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

// Tale care of req.body in case of security. Do not send your whole req.body to client
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      // Permits validators for updateTour
      runValidators: true,
    }
  );
  if (!tour) {
    return next(
      new AppError(`No tour Found this with ID`, 404)
    );
  }
  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(
      new AppError(`No tour Found this with ID`, 404)
    );
  }

  res.status(201).json({
    status: 'success',
    data: 'Tour Successfully Deleted',
  });
});

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
