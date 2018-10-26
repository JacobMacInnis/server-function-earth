'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const USLocation = require('../models/usLocation');

const seedUSLocations = require('../db/seed/usLocations.json');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      USLocation.insertMany(seedUSLocations)
    ]);
  })
  .then((results) => {
    console.log(`Inserted ${results[0].length} Locations`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });