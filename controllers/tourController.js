const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
exports.aliasTopTour = function(req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async function(req, res) {
  // console.log(req.requestTime);

  try {
    //EXECUTE A QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate(); //basically creating instance of APIFeatures that will then get stored into features then this features will have access to all the methhods that we define in the class defination
    const tours = await features.query;
    //console.log(tours);
    // const tours = await query;

    res.status(200).json({
      status: 'success',
      //requestedAt: req.requestTime
      data: {
        tours: tours
      }
    });
  } catch (err) {
    res.status(404).json({
      staus: 'failed',
      message: err
    });
  }
};
exports.getTour = async function(req, res) {
  try {
    const tour = await Tour.findById(req.params.id);
    //console.log(tour);
    res.status(200).json({
      status: 'success',
      data: {
        tours: tour
      }
    });
  } catch (err) {
    res.status(404).json({
      staus: 'failed',
      message: err
    });
  }
};

exports.createTours = async function(req, res) {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async function(req, res) {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }); //the id to find the document we want to update and 2nd argument is actually the data we want to change and 3rd argument is we can also pass in some options like here it is new:true because this way the new updated document is the one that will be returned

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async function(req, res) {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

//aggregation pipeline
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } } //match is basically to select or to filter certain document
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          nameOfTours: { $addToSet: '$name' }
        } //it allows us to group documents together basically using aacumulator and an accumulator is for example even calculating an average so if we have 5 tours each of them have ratings we can then calculate average ratings using group  (id is gonna specify what we want to group by and if we say _id:null then it means   we want to specify everything into one group (we can also group by _id:difficulty or anything ))
      },
      {
        $sort: { avgPrice: -1 }
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });

    //console.log(stats)
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates' //it deconstruct the array fields from the input document and then output one document for each element of the array yesko matlab startDates xai array ko form ma thiyo like like the forest prrker startdates:[2021-08 2021-09 2021-10]aba unwind le k garxa vane the forest parker 2021-08 the forest parker 2021-09 the forest parker 2021-10
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' }, //extracting month from startDates
          numofTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: { _id: 0 }
      },
      {
        $sort: { month: 1 }
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
