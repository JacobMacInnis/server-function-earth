'use strict';

const express = require('express');

const router = express.Router();
const moment = require('moment');
const mongoose = require('mongoose');

const UserStats = require('../models/user-stats');

/*======POST /Entries======*/
router.post('/entries', (req, res, next) => {
  const userId = req.user._id;
  const { country, stateRegion, entry, entryType } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  let type;
  if (entryType === 'Animals') {
    type = 'animal';
  } else {
    type = entryType.toLowerCase();
  }
  console.log('TYPE', type);
  let timeStamp = moment().format('MMMM Do YYYY, h:mm:ss a');
  let newEntry = {
    timeStamp: timeStamp,
    type: type,
    entry: entry,
    country: country,
    stateRegion: stateRegion
  };

  return UserStats.findOne({userId})
    .then(stats => {
      stats[`${type}Entries`].push(newEntry);
      stats[`${type}Points`] += 25;
      stats[`${type}EntriesCount`] += 1;
      stats.totalPoints += 25;
      stats.totalEntries += 1;
      if (stats.recentEntries.length < 10) {
        stats.recentEntries.push(newEntry);
      } else if (stats.recentEntries === 10) {
        stats.recentEntries.shift();
        stats.recentEntries.push(newEntry);
      }
      return stats.save();
    })
    .then(() => {
      res.json('sucessfully logged entry');
    })
    .catch(err => {
      if (err.reason === 'Error GET /stats/mystats') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});

module.exports = router;