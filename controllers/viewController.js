const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req,res) => {
    // 1 Get tour data from collection 
    const tours = await Tour.find();
    // 2 Build template 
    // 3 Render that template using tour data
    res.status(200).render('overview',{
        title:'All Tours',
        tours
      });
});

exports.getTour =catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({slug: req.params.slug}).populate({
    path: 'reviews',
    fields: 'review rating user'
  })

  if(!tour){
    return next(new AppError('There is no tour with that name', 404));
  }
 
  res.status(200)
    .render('tour', {
    title: `${tour.name} Tour`,
    tour
  })
})
 
exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy', 
      "script-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: 'User Login',
    });
};

exports.getAccount = (req, res) => {
  res
  .status(200)
  .render('account', {
    title: 'Your account',
  });

}

exports.getMyTours = catchAsync(async (req,res) => {
  // 1 Find all tours
  const bookings = await Booking.find({user: req.user.id})

  // 2 Find tours with the returned ID's
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({_id:{$in: tourIDs }});

  res.status(200).render('overview' , {
    title: 'My Tours',
    tours
  });
});