const express = require('express');

const tourRouter = express.Router();
const TourController = require('../controllers/tourController');
const AuthController = require('../controllers/authController');

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
  .get(AuthController.protect, TourController.getAllTours)
  .post(TourController.createTour);
tourRouter
  .route('/:id')
  .get(TourController.getTour)
  .patch(TourController.updateTour)
  .delete(
    AuthController.protect,
    AuthController.restrictTo('admin','lead-guide'),
    TourController.deleteTour
  );

module.exports = tourRouter;
