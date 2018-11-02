'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const User = require('../models/user');
const UserStats = require('../models/user-stats');
const states = require('./../utils/states');
const USLocation = require('./../models/usLocation');

/*======Protect Endpoints Using JWT Strategy======*/
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.post('/users', (req, res, next) => {
  const { firstName, username, password, location } = req.body;
  const requiredFields = ['username', 'password', 'firstName', 'location'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing '${missingField}' in request body`,
      location: missingField
    });
  }
  const stringFields = ['username', 'password', 'firstName', 'location'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }
  
  const explicityTrimmedFields = ['username', 'password', 'firstName'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }
  // Location Validation
  let filter = {};
  let lat, lon, city, state;

  if (/^\d+$/.test(location)) {
    if (/^\d{3,5}$/.test(location)) {
      filter.zip_code = location;
    } else {
      const err = new Error('Zip-Code must have minimum 3 digits and maximum 5 digits');
      err.status = 400;
      return next(err);
    }
  } else {
    if (location.indexOf(',') > -1) {
      let city = location.split(',')[0].trim();
      let state = location.split(',')[1].trim();
      city = city.toLowerCase()
        .split(' ')
        .map(letters => letters.charAt(0).toUpperCase() + letters.substring(1))
        .join(' ');
      filter.city = city;
      if (state.length > 2) {
        state = state.toLowerCase();
        if (states.hasOwnProperty(state)) {
          state = states[state];
          filter.state = state;
        } else {
          const err = new Error('State can not be found');
          err.status = 400;
          return next(err);
        }
      } else {
        state = state.toUpperCase().trim();
        filter.state = state;
      }
    } else {
      const err = new Error('City and State must be separated by a comma');
      err.status = 400;
      return next(err);
    }
  }
  return USLocation.findOne(filter)
    .then(location => {
      if (location === null || undefined) {
        const err = new Error('The location was not found');
        err.status = 404;
        return Promise.reject(err);
      }
      city = location.city;
      state = location.state;
    })
    .then(() => {
      User.find({ username })
        .count()
        .then(count => {
          if (count > 0) {
            //There is an existing user with same username
            return Promise.reject({
              code: 422,
              reason: 'ValidationError',
              message: 'Username already taken',
              location: 'username'
            });
          }
          return User.hashPassword(password);
        })
        .then(hash => {
          return User.create({
            username,
            password: hash,
            firstName: firstName.trim(),
            city: city,
            state: state
          });
        }) 
        .then(result => {
          return res.status(201).location('/api/users/${result.id}').json(result);
        })
        .catch(err => {
          if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
          }
          next(err);
        });
    });
});

// USES JWT TO EXTRACT USERID
router.post('/users/stats', jwtAuth, (req,res,next)=>{
  
  const userId = req.user._id;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  return User.findOne({_id: userId})
    .then(user =>{
      
      return UserStats.create({
        userId: user._id,
        username: user.username,
        state: user.state,
        city: user.city,
      });
    })
    .then(result => {
      return res.status(201).location('/api/users/stats/${result.id}').json(result);
    })
    .catch(err => {
      if (err.reason === 'UserStat Creation Error') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});


module.exports = router;