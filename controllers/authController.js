const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {promisify} = require('util')

const signToken = id => {
    return jwt.sign({id: id}, 
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN});
}

const createSendToken = (user,statusCode,res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        secure: true,
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt',token,cookieOptions);

    user.password = undefined;
    
    res.status(statusCode).json({
        status: 'success',
        token, 
        data: {
            user
        }
    });

}

exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password: req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        passwordChangedAt : req.body.passwordChangedAt,
        role: req.body.role
    });

    createSendToken(newUser,201,res);
});

exports.login =catchAsync(async (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;

    // Check if email and password exist
    if(!email || !password) {
        return next(new AppError('Provide email and pass',400));
    }

    // User exist and pass is correct
    const user = await User.findOne({email: email}).select('+password');
    
    if(!user || ! await user.correctPassword(password,user.password)){
        return next(new AppError('Incorrect email or pass',401));
    }

    // Sending token
    createSendToken(user,201,res);
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };
  
exports.protect=catchAsync(async (req,res,next)=>{
    // Getting token and check it
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if(!token){
        return next(new AppError('You are not loggen in! Please log in to get access', 401));
    }

    // Verification token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);
    // Check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return currentUser(new AppError('The token belong to this user doesnot exist aynmore!'));}

    // Check if user changed pass after token was issued
    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('Changed password. Log in again'),401);
    }

    //Access
    req.user= currentUser;
    res.locals.user = currentUser;

    next();
})

exports.isLoggedin=async (req,res,next)=>{
    if(req.cookies.jwt){
        try {
        // 1 Verify Token
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
        
        // 2 Check if user still exist
        const currentUser = await User.findById(decoded.id);
        if(!currentUser) {
            return next();
        }

        // 3 İf user changed pass
        if(currentUser.changePasswordAfter(decoded.iat)) {
            return next();
        }

        res.locals.user = currentUser;
        return next();
        }
        catch(err){
            return next();
        }

    }
    next();
}

// Middleware cant take arguments
// Used wrapper function
exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You dont have permission',403));
        }
        next();
    }
};


exports.forgotPassword = catchAsync(async (req,res,next) => {
    // Get user based on posted e mail
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError('There is no user with this email addres'),404);
    }
    // generate random reset toekn
    const resetToken = user.crPassReset();
    await user.save({validateBeforeSave:false});

    // send it to users email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    
    const message = `Forgot your password? Submit a PATCH request with your 
    new password and passwordConfirm to: ${resetURL}.\n 
    If you didn't forget your password, please ignore this email!`;
    try{
        await sendEmail({
            email: user.email,
            subject: `Your password reset token ${message} `,
            message : message
        });
        
        res.status(200).json({
            status: 'success',
            message:'Token sent to email!',
        });
    }
    catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires= undefined;
        await user.save({validateBeforeSave: false})
        console.log(err)
        return next(new AppError('There is an error sending the email try again later'),500);
    }
});


exports.resetPassword = catchAsync(async(req,res,next) => {
    // Get user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires : {$gt:Date.now()}
    })

    // If token has not expired, and there is user, set the new pass
    if (!user){
        return next(new AppError('Token is inalid or has expired'),400);
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // update changedPasswordAt property


    // Log the user in, send JWT
    createSendToken(user,200,res);
})


exports.updateMyPassword = catchAsync(async(req,res,next) => {
    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // Check if posted current pass is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Pass is incorrect'),401);
    }
    // Update pass
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();


    // Log user in, send JWT
    createSendToken(user,200,res);
});
