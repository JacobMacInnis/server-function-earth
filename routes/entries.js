'use strict';

const express = require('express');

const router = express.Router();
const moment = require('moment');
const mongoose = require('mongoose');

const UserStats = require('../models/user-stats');
const GlobalSchema = require('../models/global');
const CountrySchema = require('../models/countries');
const StateSchema = require('../models/state');
const OceanSchema = require('../models/ocean');
const TopUserSchema = require('../models/top-users');

const countryCode = require('../db/countryCode');
const stateCode = require('../db/stateCode');
const { newTopUser, newTopTypeUser } = require('../utils/helpers/sortedArrayAlgorithm');

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

/*======POST /Entries======*/
router.post('/entries', (req, res, next) => {
  const userId = req.user._id;
  const { country, stateRegion, entry, entryType, ocean } = req.body;
  let username;
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
  let newEntry;
  let timeStamp = moment().format('MMMM Do YYYY, hh:mm:ss a');
  
  if (type === 'ocean') {
    newEntry = {
      timeStamp: timeStamp,
      type: type,
      entry: entry,
      ocean: ocean  
    };
  }
  else {
    newEntry = {
      timeStamp: timeStamp,
      type: type,
      entry: entry,
      country: country,
      stateRegion: stateRegion
    };
  }
  let cc;
  let fullCountry;
  if (country !== 'US') {
    cc = countryCode[country];
    fullCountry = country;
  } else {
    cc = 'US';
    fullCountry = getKeyByValue(countryCode, cc);
  }
  let usState = 'na';
  if (cc === 'US') {
    usState = `${stateRegion}:${stateCode[stateRegion]}`;
  }
  let cdb = `${cc}:${fullCountry}`;
  let tpUser;
  let newTopArray;
  let tpTypeUser;
  let newTypeArray;
  const topType = type.charAt(0).toUpperCase() + type.slice(1);
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
      tpUser = {
        userId: stats.userId,
        username: stats.username,
        country: stats.country,
        totalPoints: stats.totalPoints,
        totalEntries: stats.totalEntries
      };
      tpTypeUser = {
        userId: stats.userId,
        username: stats.username,
        country: stats.country,
        [`${type}Points`]: stats[`${type}Points`],
        [`${type}EntriesCount`]: stats[`${type}EntriesCount`]
      }
      username = stats.username;
      return stats.save();
    })
    .then(() => {
      return GlobalSchema.findOne()
        .then(gs => {
          newEntry.username = username;
          gs.entryCount += 1;
          gs.points += 25;
          if (gs.recentEntries.length < 25) {
            gs.recentEntries.push(newEntry);
          } else if (gs.recentEntries === 25) {
            gs.recentEntries.shift();
            gs.recentEntries.push(newEntry);
          }
          gs[`${type}EntryCount`] += 1;
          gs[`${type}Points`] += 25;
          if (gs[`${type}RecentEntries`].length < 25) {
            gs[`${type}RecentEntries`].push(newEntry);
          } else if (gs[`${type}RecentEntries`].length === 25) {
            gs[`${type}RecentEntries`].shift();
            gs[`${type}RecentEntries`].push(newEntry);
          }
          return gs.save();
        });
    })
    .then(() => {
      return CountrySchema.findOne({country: cdb})
        .then(cs => {
          cs.entryCount += 1;
          cs.points += 25;
          if (cs.recentEntries.length < 25) {
            cs.recentEntries.push(newEntry);
          } else if (cs.recentEntries.length === 25) {
            cs.recentEntries.shift();
            cs.recentEntries.push(newEntry);
          }
          cs[`${type}EntryCount`] += 1;
          cs[`${type}Points`] += 25;
          if (cs[`${type}Entries`].length < 25) {
            cs[`${type}Entries`].push(newEntry);
          } else if (cs[`${type}Entries`].length === 25) {
            cs[`${type}Entries`].shift();
            cs[`${type}Entries`].push(newEntry);
          }
          return cs.save();
        });
    })
    .then(() => {
      if (usState !== 'na') {
        return StateSchema.findOne({state: usState})
          .then(ss => {
            ss.entryCount += 1;
            ss.points += 25;
            ss.entries.push(newEntry);
            return ss.save();
          });
      }
    })
    .then(() => {
      if (type === 'ocean') {
        return OceanSchema.findOne({ocean: ocean})
          .then(os => {
            os.entryCount += 1;
            os.points += 25;
            os.entries.push(newEntry);
            return os.save(); 
          });
      }
    })
    .then(() => {
      return TopUserSchema.findOne()
        .then(topUser => {
          newTypeArray = newTopTypeUser(topUser[`top${topType}Users`], tpTypeUser, type);
          return newTopArray = newTopUser(topUser.topUsers, tpUser);
        })
        .then(() => {
          return TopUserSchema.findOne()
            .then(topUser2 => {
              topUser2.topUsers = newTopArray;
              topUser2[`top${topType}Users`] = newTypeArray;
              return topUser2.save();
            });
        });
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