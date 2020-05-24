const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');


const filterObj =(obj, ...allowedFileds)=>{
  const newObj ={}
  Object.keys(obj).forEach(el =>{
    if(allowedFileds.includes(el)) newObj[el]=obj[el]
  })
  return newObj

}

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if POST to password is made
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not to update your password\n Please use UpdateMyPassword',
        400
      )
    );
    
  }

// Filtered out unwanted fields
const filteredBody = filterObj(req.body,'name','email')

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{new:true,runValidators:true})

  res.status(200).json({
    status:"success",
    data:{
      user:updatedUser
    }
  })
});
exports.deleteMe =catchAsync(async (req,res,next)=>{
  await User.findOneAndUpdate(req.user.id,{active:false})

  res.status(204).json({
    statue:"success",
    data:null
  })

})

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results:users.length,
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
