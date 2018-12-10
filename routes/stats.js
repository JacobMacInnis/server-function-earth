'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const UserStats = require('../models/user-stats');

/*======GET /Stats======*/
router.get('/stats', (req, res, next) => {
  const userId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  return UserStats.findOne({userId})
    .then(statsObject => {
      console.log(statsObject.recentEntries);
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