'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const UserStats = require('../models/user-stats');

/*======POST /Entries======*/
router.post('/entries', (req, res, next) => {
  console.log('here1');
  const userId = req.user._id;
  const { newEntry } = req.body;
  console.log('here too')
  console.log('here?', newEntry);
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  return UserStats.findOne({userId})
    .then(statsObject => {
      console.log(statsObject);
      res.json(statsObject);
    })
    .catch(err => {
      if (err.reason === 'Error GET /stats/mystats') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});

module.exports = router;