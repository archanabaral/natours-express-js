const express = require('express');
const morgan = require('morgan');
const tourRouter=require('./routes/tourRoutes');
const userRouter=require('./routes/userRoutes');
const app = express();
if(process.env.NODE_ENV==='development'){//we have access to these environment variable although we have not defined it here it is because the reading of the variable from the file server.js to the node process only needs to happen once (ani jati otai file vaye ni process ta eutai ho ani environment variable are on the  process so ekxoti declare garda hunxa)
  
  //using morgan as middleware
app.use(morgan('dev'));
}
//using morgan as middleware
app.use(morgan('dev'));

app.use(express.json());
//to server the static file 
app.use(express.static('public'))

//creating our own middleware function
app.use(function(req, res, next) {
  console.log('hello');
  next();
});
app.use(function(req, res, next) {
  req.requestTime = new Date().toISOString(); //adding current time to request
  next();
});
//now connecting these new router which we have made seperate files now  with our application while we will use it as middleware
  //here it means the middleware tourRouter which we want to use for the specific route (i.e the given URL)
app.use('/api/v1/tours', tourRouter); 
app.use('/api/v1/users', userRouter);

module.exports = app;
