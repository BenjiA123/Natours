const express = require('express');
const ReviewController = require('../controllers/reviewController');
const AuthController = require('../controllers/authController');

const reviewRouter = express.Router({
  mergeParams: true,
});

reviewRouter.use(AuthController.protect);
reviewRouter
  .route('/')
  .post(
    AuthController.restrictTo('user'),
    ReviewController.setTourUserIds,
    ReviewController.createReview
  )
  .get(ReviewController.getAllReviews);

reviewRouter
  .route('/:id')
  .get(ReviewController.getReview)
  .patch(
    AuthController.restrictTo('user','admin'),
    ReviewController.updateReview
  )
  .delete(
    AuthController.restrictTo('user','admin'),
    ReviewController.deleteReview
  );

module.exports = reviewRouter;
