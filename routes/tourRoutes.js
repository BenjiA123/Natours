const express = require('express');

const tourRouter = express.Router();
const TourController = require('../controllers/tourController');
const AuthController = require('../controllers/authController');
const ImageController = require('../controllers/imageController');
// const ReviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

tourRouter.use('/:tourId/reviews', reviewRouter);
tourRouter.route('/top-5-cheap').get(TourController.aliasTopTours, TourController.getAllTours);
tourRouter
  .route('/montly-plan/:year')
  .get(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide', 'guide'),
    TourController.getMonthlyPlan
  );

  tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(TourController.getToursWithin);


  tourRouter.route('/distances/:latlng/unit/:unit').get(TourController.getDistances);

tourRouter.route('/tour-stats').get(TourController.getToursStats);
tourRouter
  .route('/')
  .get(TourController.getAllTours)
  .post(AuthController.protect, AuthController.restrictTo('admin', 'lead-guide'), TourController.createTour);
tourRouter
  .route('/:id')
  .get(TourController.getTour)
  .patch(AuthController.protect,
     AuthController.restrictTo('admin', 'lead-guide'),
     ImageController.uploadTourImages,
     ImageController.resizeTourImages,
     TourController.updateTour)
  .delete(TourController.deleteTour);

module.exports = tourRouter;
