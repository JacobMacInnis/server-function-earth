'use strict';
 
const mongoose = require('mongoose');

const globalStats = new mongoose.Schema({
  allPoints: {type: Number, default: 0},
  allEntriesCount: {type: Number, default: 0},
  allEntriesRecent: {type: Array, default: []},
  earthPoints: {type: Number, default: 0},
  earthEntriesCount: {type: Number, default: 0},
  earthEntriesRecent: {type: Array, default: []},
  oceanPoints: {type: Number, default: 0},
  oceanEntriesCount: {type: Number, default: 0},
  oceanEntriesRecent: {type: Array, default: []},
  animalPoints: {type: Number, default: 0},
  animalEntriesCount:{type: Number, default: 0},
  animalEntriesRecent: {type: Array, default: []},
  humanityPoints: {type: Number, default: 0},
  humanityEntriesCount:{type: Number, default: 0},
  humanityEntriesRecent: {type: Array, default: []},
  countries: {type: Object, default: {}},
  states: {type: Object, default: {}},
  ocean: {type: Object, default: {} }
});
globalStats.set('timestamps', true);

globalStats.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('GlobalStats', globalStats);