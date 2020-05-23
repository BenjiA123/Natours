const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if POST to password is made
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not to update ypur password\n Please use UpdateMyPassword',
        400
      )
    );
    
  }
  res.status(200).json({
    status:"success"
  })
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    users,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};
exports.deleteUser = (req, res) => {
  // User.deleteMany().then(
  //   res.status(200).json({
  //     status: 'success',
  //     message: 'This message wes deleted',
  //   })
  // );
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};
