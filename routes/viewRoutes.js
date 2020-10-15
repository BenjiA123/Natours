const express = require('express');
const ViewController = require('../controllers/viewsController')
const viewRouter = express.Router();
const AuthController = require('../controllers/authController')


viewRouter.get('/',AuthController.isLoggedIn,ViewController.getOverView);
viewRouter.get('/tour/:slug',AuthController.isLoggedIn,ViewController.getTour);
viewRouter.get('/account',AuthController.protect,ViewController.getAccount);

viewRouter.get('/login',AuthController.isLoggedIn,ViewController.login);



module.exports = viewRouter