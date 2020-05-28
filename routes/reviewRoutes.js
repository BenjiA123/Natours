const express = require('express');
const ReviewController = require('../controllers/reviewController');
const AuthController = require('../controllers/authController');

const reviewRouter = express.Router({
  mergeParams: true,
});

reviewRouter
  .route('/')
  .post(
    AuthController.protect,
    AuthController.restrictTo('user'),
    ReviewController.setTourUserIds,
    ReviewController.createReview
  )
  .get(ReviewController.getAllReviews);

reviewRouter
  .route('/:id')
  .get(ReviewController.getReview)

  .delete(ReviewController.deleteReview)
  .patch(ReviewController.updateReview);
module.exports = reviewRouter;
