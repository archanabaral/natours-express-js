const mongoose = require('mongoose');
const slugify = require('slugify');
const validator=require('validator');
const tourSchema = new mongoose.Schema(
  {
    // new mongoose.schema to specify schema for our data
    //name:String
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength:[40,'A tour name must have less or equal 40 characters'],
      minlength:[10,'a tour must have more or equal than 10 character'],
      validate:[validator.isAlpha,'Tour names must only contain characters']
    },
    slug:String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']//required is built-in validator
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum:{
        values:['easy','medium','difficult'],
        message:"DIFFICULTY IS EITHER:EASY,MEDIUM,DIFFICULT"
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min:[1,"Rating must be above 1.0"],
      max:[5,'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type:Number,
      validate:{
        
       validator: function(value){//callback function has access to the value that was inputed here in this case it is priceDiscount that user specify
        
        //inside a  validator function this only points to current document on NEW document creation and not on update (validator function is going to run only during creation and not while updating)
        return value < this.price;
         
      },//to specify our validator we use validate property
       message:"Discount price ({VALUE}) should be less than price"
      
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },

    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour:{
      type:Boolean,
      default:false
    }

  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);
//VIRTUAL PROPERTY
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
}); //virtual(here name of the virtual property) get()method so that virtaul property will be basically created each time when we  get  some data from the database

// mongoose DOCUMENT MIDDLEWARE:it runs before only .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true }); //slug is basically just a string  that we can put into URL usually based on some sting like name
  next();

  //console.log(this);//this refers to current document ({this }is the document  right before we actually saved data to the database)

}); //pre middleware is gonna run before an actual event and that event in this case is save

tourSchema.post('save',function(doc,next){//In the case of post middleware it has access to document that was just saved to the database post middleware function are executed after all pre middleware function are executed 
  console.log(doc);
  next();
})
//QUERY MIDDLEWARE and here this represent current query and we can chain all method that we have for querys
tourSchema.pre(/^find/,function(next){//using regular expression here used is /^find/ and it indicate to execute middleware not only for find but for all the command that start with the name find like findone,findoneanddelete and so on
 // tourSchema.pre('find',function(next)
  //this is executed before const tours=await features.query
  this.find({secretTour:{$ne:true}})//yeti garda hamile junlai xai secretTour:true garya xa tyo document lai dekhaudaina
  next();
})
tourSchema.post(/^find/,function(docs,next){//it is gonna run after the query has already executed and so it can have access to the document that were return
 console.log(docs);
next();

})

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate',function(next){
 // console.log(this.pipeline());//this here points to the current aggretion object
 this.pipeline().unshift({ $match:{secretTour:{$ne:true}}})//pipeline()is array and to add element at the begining of the aarasy we use unshift
  next();
})
const Tour = mongoose.model('Tours', tourSchema); //name of the model and name of schema

// const testTour= new Tour({
//   name:"the hikings",
//   rating:4.8,
//   price:497
// })
// testTour.save().then(doc=>{
//   console.log(doc);
// }).catch(err=>{
//   console.log(err);
// })

module.exports = Tour;
