'use strict';

const express = require('express');

const router = express.Router();
const moment = require('moment');
const mongoose = require('mongoose');

const UserStats = require('../models/user-stats');
const GlobalStats = require('../models/GlobalStats');
const countryCode = require('../db/countryCode');
const stateCode = require('../db/stateCode');

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
  let timeStamp = moment().format('MMMM Do YYYY, h:mm:ss a');
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
  let cc = countryCode[country];
  let usState = 'na';
  if (cc === 'US') {
    usState = `${stateRegion}:${stateCode[stateRegion]}`;
  }
  let cdb = `${cc}:${country}`;
  console.log(cdb);
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
      username = stats.username;
      return stats.save();
    })
    .then(() => {
      return GlobalStats.findOne()
        .then(gs => {
          newEntry.username = username;
          gs.allPoints += 25;
          gs.allEntriesCount += 1;
          if (gs.allEntriesRecent.length < 10) {
            gs.allEntriesRecent.push(newEntry);
          } else if (gs.allEntriesRecent === 10) {
            gs.allEntriesRecent.shift();
            gs.allEntriesRecent.push(newEntry);
          }
          // Ocean Entries
          if (type === 'ocean') {
            gs.oceanPoints += 25;
            gs.oceanEntriesCount += 1;
            if (gs.oceanEntriesRecent < 10) {
              gs.oceanEntriesRecent.push(newEntry);
            } else if (gs.oceanEntriesRecent === 10) {
              gs.oceanEntriesRecent.shift();
              gs.oceanEntriesRecent.push(newEntry);
            }
            gs.oceans[ocean].totalPoints += 25;
            gs.oceans[ocean].totalEntries += 1;
            gs.oceans[ocean].entries.push(newEntry);
          } else {
            // Not an Ocean Entry
            gs[`${type}Points`] += 25;
            gs[`${type}EntriesCount`] += 1;
            if (gs[`${type}EntriesRecent`].length < 10) {
              gs[`${type}EntriesRecent`].push(newEntry);
            } else if (gs[`${type}EntriesRecent`].length === 10) {
              gs[`${type}EntriesRecent`].shift();
              gs[`${type}EntriesRecent`].push(newEntry);
            }
            console.log(gs.countries[cdb].totalEntries)
            gs.countries[cdb].totalEntries += 1;
            console.log(gs.countries[cdb].totalEntries)
            gs.countries[cdb].totalPoints += 25;
            if (gs.countries[cdb].recentEntries.length < 10) {
              gs.countries[cdb].recentEntries.push(newEntry);
            } else if (gs.countries[cdb].recentEntries.length === 10) {
              gs.countries[cdb].recentEntries.shift();
              gs.countries[cdb].recentEntries.push(newEntry);
            }
            gs.countries[cdb].entries[`${type}EntryCount`] += 1;
            gs.countries[cdb].entries[`${type}TotalPoints`] += 25;
            gs.countries[cdb].entries[`${type}Entries`].push(newEntry);
            if (type !== 'ocean' && cc === 'US') {
              gs.states[usState].totalEntries += 1;
              gs.states[usState].totalPoints += 25;
              gs.states[usState].entries.push(newEntry);
            }
          }
          return gs.save();
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