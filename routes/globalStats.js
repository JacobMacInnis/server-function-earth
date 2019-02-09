'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const GlobalSchema = require('../models/global');
const OceanSchema = require('../models/ocean');
const CountrySchema = require('../models/countries');
const TopUserSchema = require('../models/top-users');

/*======GET /Stats======*/
router.get('/globalstats', (req, res, next) => {
  const userId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  let returnObj = {};
  return GlobalSchema.findOne()
    .then(statsObject => {
      returnObj.recentEntries = statsObject.recentEntries;
      returnObj.earthRecentEntries = statsObject.earthRecentEntries;
      returnObj.oceanRecentEntries = statsObject.oceanRecentEntries;
      returnObj.animalRecentEntries = statsObject.animalRecentEntries;
      returnObj.humanityRecentEntries = statsObject.humanityRecentEntries;
      returnObj.entryCount = statsObject.entryCount;
      returnObj.points = statsObject.points;
      returnObj.earthPoints = statsObject.earthPoints;
      returnObj.earthEntryCount = statsObject.earthEntryCount;
      returnObj.oceanPoints = statsObject.oceanPoints;
      returnObj.oceanEntryCount = statsObject.oceanEntryCount;
      returnObj.animalPoints = statsObject.animalPoints;
      returnObj.animalEntryCount = statsObject.animalEntryCount;
      returnObj.humanityPoints = statsObject.humanityPoints;
      returnObj.humanityEntryCount = statsObject.humanityEntryCount;
      return OceanSchema.find();
    })
    .then(oceans => {
      const artic = oceans.find(obj => obj.ocean === 'Artic');
      const atlantic = oceans.find(obj => obj.ocean === 'Atlantic');
      const indian = oceans.find(obj => obj.ocean === 'Indian');
      const pacific = oceans.find(obj => obj.ocean === 'Pacific');
      const southern = oceans.find(obj => obj.ocean === 'Southern');

      returnObj.oceans = {
        artic: {
          entryCount: artic.entryCount,
          points: artic.points
        },
        atlantic: {
          entryCount: atlantic.entryCount,
          points: atlantic.points
        },
        indian: {
          entryCount: indian.entryCount,
          points: indian.points
        },
        pacific: {
          entryCount: pacific.entryCount,
          points: pacific.points
        },
        southern: {
          entryCount: southern.entryCount,
          points: southern.points
        }
      };
      return TopUserSchema.findOne();
    })
    .then(topUsers => {
      returnObj.topUsers = topUsers;
    })
    .then(() => {
      res.json(returnObj);
    })
    .catch(err => {
      if (err.reason === 'Error GET /stats/globalstats') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});

module.exports = router;