const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/userController');

userRouter
  .route('')
  .get(UserController.getAllUsers)
  .post(UserController.createUser);
userRouter
  .route('/:id')
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);
  
  module.exports = userRouter;