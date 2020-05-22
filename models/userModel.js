const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'PLease tell us Your Name '],
  },
  email: {
    type: String,
    required: true,
    minlength: [5, 'This email is too short'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide a valid Email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please Provide a password'],
    minlength: [8, 'Password is too short'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
    message: 'passwords Are not the same',
  },
  // not working
  passwordChangedAt: { type: Date, select: true },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  // Only runs if password was modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 8);
  // delete passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

// For logging in checks if passwords are the same
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password change happened after a token was created
// This would make the token invalid which is good for security
userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimeStamp;
  }
  // false means user password not changed
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  console.log({resetToken},this.passwordResetToken)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken
};

const User = mongoose.model('User', userSchema);
module.exports = User;
