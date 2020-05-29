const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(
      req.params.id
    );

    if (!document) {
      return next(
        new AppError(
          `No document Found this with ID`,
          404
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: 'Document Successfully Deleted',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        // Permits validators for updateTour
        runValidators: true,
      }
    );
    if (!document) {
      return next(
        new AppError(
          `No document Found this with ID`,
          404
        )
      );
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate('reviews');
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(
          `No document Found this with ID`,
          404
        )
      );
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId)
      filter = { tour: req.params.tourId };
    const features = new APIFeatures(
      Model.find(filter),
      req.query
    )
      .filter()
      .sort()
      .limit()
      .paginate();
    // const doc = await features.query.explain(); The explain method explains the whole document
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: { data: doc },
    });
  });
