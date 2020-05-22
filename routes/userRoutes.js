const express = require('express');

const userRouter = express.Router();
const UserController = require('../controllers/userController');
const AuthController = require('../controllers/authController');

userRouter.post('/signup', AuthController.signup);
userRouter.post('/login', AuthController.login);

userRouter.post('/forgotPassword', AuthController.forgotPassword);
userRouter.patch('/resetPassword/:token', AuthController.resetPassword);

userRouter
  .route('')
  .get(UserController.getAllUsers)
  .post(UserController.createUser)
  // You would later delete this delete route
  // .delete(UserController.deleteUser);
userRouter
  .route('/:id')
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

module.exports = userRouter;
