const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// creating the token with SECRETE, ID and EXPIRATION TIME
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
      token,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', 400)
    );
  }
  // Including password into schema Recall {select:false}
  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password,user.password)

  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Check if the token is there and get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in', 401)
    );
  }
  // Verify the token

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check if the user has changed any of his credentials ie If theoriginal user credentials still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token no longer exist'
      ),
      401
    );
  }
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    // Their is a bug here
    return next(
      new AppError(
        'User password was recently changed. Please log in again'
      ),
      401
    );
  }
  req.user = currentUser;
  // GRANT ACCESS TO THE PROTECTED ROUTE

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array['admin,'lead-guide]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have the permission to perform this action',
          403
        )
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on posted email
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user)
    return next(
      new AppError('This email is not recorded email address ', 404)
    );

  // Generate Random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // Send it to users email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgor your password? Submit your new password to ${resetURL}.\n
  If you didnt request for this Please ignore this email`;

  try {
    console.log(req.get(
      'host'
    ))
    await sendEmail({
      email: user.email,
      subject: "You're password request token (valid for 10mins)",
      message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Token sent to email',
    });
  } catch (error) {
    console.log(error)
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
return next(new AppError('Their was an error sending this email. Try again later',500))
  }
});

exports.resetPassword = (req, res, next) => {





};
