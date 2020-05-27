const express = require('express');
const ReviewController = require('../controllers/reviewController');
const AuthController = require('../controllers/authController');

const reviewRouter = express.Router();

reviewRouter
  .route('/')
  .post(
    AuthController.protect,
    AuthController.restrictTo('user'),
    ReviewController.createReview
  )
  .get(ReviewController.getAllReviews);

module.exports = reviewRouter;
