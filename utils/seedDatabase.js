'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

// Schemas
const GlobalSchema = require('../models/global');
const CountrySchema = require('../models/countries');
const StatesSchema = require('../models/state');
const OceanSchema = require('../models/ocean');

// Seed Data
const countries = require('../db/countryArray');
let states = require('../db/states');
const oceans = require('../db/oceans');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      GlobalSchema.create({allPoints: 25}),
      CountrySchema.insertMany(countries),
      StatesSchema.insertMany(states),
      OceanSchema.insertMany(oceans)
    ]);
  })
  .then((results) => {
    console.log('inserted contries and oceans into globalStats collection');
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });