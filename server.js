const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); //to specify the path where our configuration file is located (it read a variables from the file and save them into node js environment variable )
const app = require('./index');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

//connecting database to application using mongoose
mongoose
  .connect(DB, {
    //connect method returns promise
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(function() {
    console.log('DB connection succesful');
  });
  
//environment variable is much realted to nodejs and is very much outside the scope of  express but express saves environment variable to development by default
console.log(app.get('env')); //environment variable is used to define the environment in which the express is running

//console.log(process.env);// bunch of environment variable

app.listen(3000);
