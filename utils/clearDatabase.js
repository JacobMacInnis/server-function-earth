'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const User = require('../models/user');
const UserStats = require('../models/user-stats');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    console.log('function-earth db dropped');
    mongoose.disconnect();
  })
  .catch(err => {
    console.log(err);
  });