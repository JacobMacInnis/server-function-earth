'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const User = require('../models/user');
const UserStats = require('../models/user-stats');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.collections['users'].drop( function(err) {
    console.log('User collection dropped');
  }))
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });