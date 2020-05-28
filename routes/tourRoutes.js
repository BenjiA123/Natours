const express = require('express');

const tourRouter = express.Router();
const TourController = require('../controllers/tourController');
const AuthController = require('../controllers/authController');
// const ReviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes')



tourRouter.use('/:tourId/reviews',reviewRouter)

// tourRouter
//   .route('/:tourId/reviews')
//   .post(
//     AuthController.protect,
//     AuthController.restrictTo('user'),
//     ReviewController.createReview
//   );



// tourRouter.param('id', TourController.checkID);
tourRouter
  .route('/top-5-cheap')
  .get(
    TourController.aliasTopTours,
    TourController.getAllTours
  );
tourRouter
  .route('/montly-plan/:year')
  .get(TourController.getMonthlyPlan);
tourRouter
  .route('/tour-stats')
  .get(TourController.getToursStats);
tourRouter
  .route('/')
  .get(
    AuthController.protect,
    TourController.getAllTours
  )
  .post(TourController.createTour);
tourRouter
  .route('/:id')
  .get(TourController.getTour)
  .patch(TourController.updateTour)
  .delete(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.deleteTour
  );


module.exports = tourRouter;
