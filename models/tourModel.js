const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
 

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true,'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40,'A tour name must have max 40 char'],
      minlength: [10,'A tour name must have min 40 char']
    },
    slug: String,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values:['easy','medium','difficult'],
        message:"Diff. is either easy,mid,hard"}
    },

    ratingsAvarage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be min 1 "],
      max: [5, "Rating must be max 5 "],
      set: val => Math.round(val*10)/10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    priceDiscount: {
      type: Number,
      validate: 
      {
        validator: function(val){
          // this keyword points to only current doc. does not work with updated values
        return val<this.price;
      },
        message:'Discount price is not applicable '

      }
    },
    price: {
      type: Number,
      required: [true,'A tour must have a name']
    },
    summary: {
      type: String,
      required: [true,'A tour must have a summary'],
      trim: true
    },
    description: {
      type: String, 
      trim: true
    },
    imageCover: {
      type: String,
      required: [true,'A tour must have a cover image'],
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now()
    },

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },

    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],

    guides: [
      {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
      }
    ],

  },

  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

// DATABASE INDEXING

  tourSchema.index({price:1,ratingsAvarage:-1});
  tourSchema.index({slug:1});
  tourSchema.index({startLocation: '2dsphere'});


  tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
  });

  // Virtual populate

  tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
  })


  // DOCUMET MIDDLEWARE
  // runs before .save() and .create()
  tourSchema.pre('save',function(next){
    this.slug = slugify(this.name, {lower:true})
    next();
  })

  /*
  tourSchema.pre('save', async function(next) {
    const guidesPromises = this.guides.map(async id => await User.findById(id));
    this.guides = await Promise.all(guidesPromises);
  });
  */ 


  /*
  tourSchema.pre('save',function(next){
    console.log("MW2");
    next();
  })
  tourSchema.post('save',function(doc,next){
    console.log(doc);
    next();
  })
*/

// QUERY MIDDLEWARE

tourSchema.pre(/^find/,function(next){
  this.find({secretTour: { $ne: true}});

  this.start = Date.now();
  next();
})

tourSchema.pre(/^find/, function(next){
  this.populate({
    path:'guides',
    select:'-__v,-passwordChangedAt'
  })
  next()
})


tourSchema.post(/^find/,function(docs,next){
  console.log(`Query took ${Date.now()-this.start} miliseconds!`);
  next();
})

// AGGREGATION MIDDLEWARE


// IF geoNear is used, it must be the first stage in the pipeline EDIT THIS. VID172 8:30

/* tourSchema.pre('aggregate',function(next){
  this.pipeline().unshift({ 
    $match: {secretTour: {$ne:true}}
  })
  console.log(this.pipeline());
  next();
}) */

  const Tour = mongoose.model('Tour',tourSchema);
  module.exports = Tour;