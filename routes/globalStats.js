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
      returnObj.oceans = {
        artic: {
          entryCount: oceans[0].entryCount,
          points: oceans[0].points
        },
        atlantic: {
          entryCount: oceans[1].entryCount,
          points: oceans[1].points
        },
        indian: {
          entryCount: oceans[2].entryCount,
          points: oceans[2].points
        },
        pacific: {
          entryCount: oceans[3].entryCount,
          points: oceans[3].points
        },
        southern: {
          entryCount: oceans[4].entryCount,
          points: oceans[4].points
        }
      };
    })
    .then()
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