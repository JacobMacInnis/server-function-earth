'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

// const USLocation = require('../models/usLocation');

// const seedUSLocations = require('../db/seed/usLocations.json');
let countries = require('../db/entries');
let oceanEntries = require('../db/oceanEntries');
let states = require('../db/states');
const globalStats = require('../models/globalStats');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      globalStats.create({
        countries: countries,
        ocean: oceanEntries,
        states: states
      })
    ]);
  })
  .then((results) => {
    console.log('inserted contries and oceans into globalStats collection');
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });