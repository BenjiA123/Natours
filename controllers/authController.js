const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const Email = require('../utils/email');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// creating the token with SECRETE, ID and EXPIRATION TIME
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const cookieOptions = {
  expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  // Ensures that cookies are only sent on a secure connection(HTTPS)
  // secure:false,
  httpOnly: true,
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,

    data: {
      user,
    },
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

  const url = `${req.protocol}://${req.get('host')}/account`
  console.log(url)
  await new Email(newUser,url).sendWelcome()
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // Including password into schema Recall {select:false}
  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password,user.password)

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Check if the token is there and get it
  let token;
  if (
    // Configuration for POSTMAN
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Configuration for WEB BROWSERS

    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in', 401));
  }
  // Verify the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user has changed any of his credentials ie If theoriginal user credentials still exist
  const currentUser = await User.findById(decoded.id);
  console.log(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exist'), 401);
  }
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    // Their is a bug here
    return next(
      new AppError('User password was recently changed. Please log in again'),
      401
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;

  // GRANT ACCESS TO THE PROTECTED ROUTE

  next();
});

// Only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  // Check if the token is there and get it
  let token;
  if (req.cookies.jwt) {
    try {
      // Verify the token

    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    // Check if the user has changed any of his credentials ie If theoriginal user credentials still exist
    const currentUser = await User.findById(decoded.id);
    console.log(decoded.id);
    if (!currentUser) {
      return next();
    }
    if (currentUser.changesPasswordAfter(decoded.iat)) {
      // Their is a bug here
      return next();
    }

    res.locals.user = currentUser;
    // LOGGED IN USER
    return next();
    } catch (error) {
      return next()
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array['admin,'lead-guide]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have the permission to perform this action', 403)
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

  if (!user) return next(new AppError('This email is not recorded email address ', 404));

  // Generate Random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // Send it to users email
  
  
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user,resetURL).sendPasswordReset()

    res.status(200).json({
      status: 'Success',
      message: 'Token sent to email',
    });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('Their was an error sending this email. Try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token and compare token to see if it has expired
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // Check if there is a user
  if (!user) {
    return next(new AppError('Token is Invalid or has expired', 400));
  }
  // Change Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Log user in with JWT
  createSendToken(user, 200, res);
});


exports.logout = (req,res,next)=>{

  res.cookie('jwt','logout',{
    expires:new Date(Date.now()+10),
    httpOnly:true
  })
  res.status(200).json({
    status:"success"
  })
}

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Check if the user has changed any of his credentials ie If theoriginal user credentials still exist

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('You are not a registered User', 400));
  }
  // Check if Posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // If so update App
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // User.findById and Update will not work well in this case
  // Middlewares and validation will not run
  await user.save();
  // Log user in send JWT
  createSendToken(user, 200, res);
});
