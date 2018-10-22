'use strict';

const express = require('express');

const User = require('../models/user');
const QuizStat = require('../models/quizStat');
const cscards = require('./../db/seed/cscards.json');

const router = express.Router();

router.post('/users', (req, res, next) => {
  const { firstName, username, password } = req.body;
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing '${missingField}' in request body`,
      location: missingField
    });
  }
  const stringFields = ['username', 'password', 'firstname'];
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

  return User.find({ username })
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

router.post('/stats',(req,res,next)=>{

  const {username} = req.body;
  return User.findOne({username})
    .then(user =>{
      return QuizStat.create({
        userId: user._id,
        recurringCorrect: 0,
        totalQuestions:0,
        questions:cscards,
        head:0,
        totalRight:0
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



module.exports = router;