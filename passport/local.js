'use strict';

const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../models/user');


/*==== Define and Create basicStrategy====*/
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;
  User.findOne({ username })
    .then(results => {
      user = results;
      if (!user) {
        const err = new Error('Incorrect username');
        err.status = 400;
        err.location = 'username';
        err.message = 'Incorrect Username';
        return Promise.reject(err);
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        const err = new Error('Incorrect Password');
        err.status = 401;
        err.message = 'Incorrect Password';
        err.location = 'password'; 
        return Promise.reject(err);
      }
      return done(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false);
      }
      return done(err);
    });
});

module.exports = localStrategy;