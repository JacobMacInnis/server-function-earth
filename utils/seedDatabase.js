'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

// Schemas
const GlobalSchema = require('../models/global');
const CountrySchema = require('../models/countries');
const StatesSchema = require('../models/state');
const OceanSchema = require('../models/ocean');
const TopUserSchema = require('../models/top-users');
const UserSchema = require('../models/user');
const UserStatsSchema = require('../models/user-stats');

// Seed Data
const global = require('../db/global');
const countries = require('../db/countryArray');
const states = require('../db/states');
const oceans = require('../db/oceans');
const users = require('../db/users');
const userStats = require('../db/userStats');
const topUsers = require('../db/topUsers');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      GlobalSchema.create(global),
      CountrySchema.insertMany(countries),
      StatesSchema.insertMany(states),
      OceanSchema.insertMany(oceans),
      TopUserSchema.create(topUsers),
      UserSchema.insertMany(users),
      UserStatsSchema.insertMany(userStats)
    ]);
  })
  .then((results) => {
    console.log('inserted contries and oceans into globalStats collection');
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });