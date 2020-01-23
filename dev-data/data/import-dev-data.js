const fs = require('fs');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
dotenv.config({ path: './config.env' }); //to specify the path where our configuration file is located (it read a variables from the file and save them into node js environment variable )

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

//READ JSON FILE 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//IMPORT DATA INTO DATABASE FROM FILE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data succesfully loaded');
  } catch (err) {
    console.log(err);
  }
};

//DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data succesfully deleted');
  } catch (err) {
    console.log(err);
  }
};
if(process.argv[2]==='--import')//here process.argv[2] is the --import that we gave in console
{
    importData();
}else if(process.argv[2]==='--delete'){
    deleteData();
}
console.log(process.argv);
