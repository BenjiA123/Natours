const express = require('express');

const userRouter = express.Router();
const UserController = require('../controllers/userController');
const AuthController = require('../controllers/authController');

// Authentication
userRouter.post('/signup', AuthController.signup);
userRouter.post('/login', AuthController.login);

userRouter.post(
  '/forgotPassword',
  AuthController.forgotPassword
);
userRouter.patch(
  '/resetPassword/:token',
  AuthController.resetPassword
);

// Protect all routes after middleware
userRouter.use(AuthController.protect);
userRouter.patch(
  '/updateMyPassword',
  AuthController.updatePassword
);

userRouter.patch('/updateMe', UserController.updateMe);

userRouter.get(
  '/me',
  UserController.getMe,
  UserController.getUser
);
userRouter.delete(
  '/deleteMe',
  UserController.deleteMe
);

userRouter.use(AuthController.restrictTo('admin'))

userRouter
  .route('/')
  .get(UserController.getAllUsers)
  .post(UserController.createUser);
userRouter
  .route('/:id')
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

module.exports = userRouter;
