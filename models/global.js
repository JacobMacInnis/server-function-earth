'use strict';
 
const mongoose = require('mongoose');

const GlobalSchema = new mongoose.Schema({
  points: {type: Number, default: 0},
  entryCount: {type: Number, default: 0},
  recentEntries: {type: Array, default: []},
  earthPoints: {type: Number, default: 0},
  earthEntryCount: {type: Number, default: 0},
  earthRecentEntries: {type: Array, default: []},
  oceanPoints: {type: Number, default: 0},
  oceanEntryCount: {type: Number, default: 0},
  oceanRecentEntries: {type: Array, default: []},
  animalPoints: {type: Number, default: 0},
  animalEntryCount:{type: Number, default: 0},
  animalRecentEntries: {type: Array, default: []},
  humanityPoints: {type: Number, default: 0},
  humanityEntryCount:{type: Number, default: 0},
  humanityRecentEntries: {type: Array, default: []},
});
GlobalSchema.set('timestamps', true);

GlobalSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('GlobalSchema', GlobalSchema);