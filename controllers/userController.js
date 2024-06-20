
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = ( obj, ...allowField) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowField.includes(el)) newObj[el] = obj[el]; 
    })
    return newObj;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
  
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  }); 


exports.updateMe = catchAsync(async (req, res,next) => {
    console.log("req.body",req.body);
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for updating password.",400))
    }

    const filteredBody = filterObj(req.body,'name','email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id , filteredBody, 
        { new: true, runValidators:true});
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser}
    });
}); 

exports.deleteMe = catchAsync(async (req, res,next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
        status: 'success',
        data: null
    });
});


exports.createUser = (req,res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}

exports.getUser = (req,res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}

exports.updateUser = (req,res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}

exports.deleteUser = (req,res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}
