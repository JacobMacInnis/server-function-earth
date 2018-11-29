'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const User = require('../models/user');
const UserStats = require('../models/user-stats');
const states = require('./../utils/states');
const USLocation = require('./../models/usLocation');
const countries = require('./../db/countries.json');
const countryCodes = require('./../db/countryCodes.json');

/*======Protect Endpoints Using JWT Strategy======*/
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

/*======POST /Users======*/
router.post('/users', (req, res, next) => {
  const { firstName, username, password } = req.body;
  const requiredFields = ['username', 'password', 'firstName'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing '${missingField}' in request body`,
      location: missingField
    });
  }
  const stringFields = ['username', 'password', 'firstName'];
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
        firstName: firstName.trim()
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

/*======POST /users/stats======*/

router.post('/users/stats', jwtAuth, (req,res,next)=>{
  const userId = req.user._id;
  let { country, city, state } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  const requiredFields = ['country', 'state', 'city'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing '${missingField}' in request body`,
      location: missingField
    });
  }
  const stringFields = ['country', 'city', 'state'];
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
  const explicityTrimmedFields = ['country', 'city', 'state'];
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
    country: {
      min: 2,
      max: 50
    },
    city: {
      min: 2,
      max: 50
    },
    state: {
      min: 2,
      max: 50
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
  // VALIDATE COUNTRY 
  let Country = '';
  if (country.length > 2) {
    country = country.trim()
      .toLowerCase()
      .split(' ')
      .map(letters => letters.charAt(0).toUpperCase() + letters.substring(1))
      .join(' ');

    if (countries.find(ct => ct === country) === undefined) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: '`Country` was not found',
        location: country
      });
    }
  } 
  else if (country.length === 2) {
    country = country.toUpperCase();
    if (countryCodes.find(ct => ct.slice(0,2) === country) === undefined) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: '`Country code` was not found',
        location: country
      });
    } 
    else {
      country = countryCodes.find(ct => ct.slice(0,2) === country).split(':')[1];
    }
  }

  // VALIDATE CITY
  city = city.trim()
    .toLowerCase()
    .split(' ')
    .map(letters => letters.charAt(0).toUpperCase() + letters.substring(1))
    .join(' ');
  
  // VALIDATE STATE
  state = state.trim()
    .toLowerCase();
  if (state.length > 2) {
    state = state.toLowerCase();
    if (states.hasOwnProperty(state)) {
      state = states[state];
      location.state = state;
    } else {
      const err = new Error('State can not be found');
      err.status = 400;
      err.reason = 'State can not be found in the US State-database';
      err.location = 'State';
      return next(err);
    }
  } else {
    state = state.toUpperCase().trim();
  }

  return User.findOne({_id: userId})
    .then(user =>{
      return UserStats.create({
        userId: user._id,
        username: user.username,
        country: country,
        state: state,
        city: city,
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