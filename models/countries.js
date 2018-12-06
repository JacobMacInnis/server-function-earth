'use strict';

const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  country: {type: String},
  entryCount: {type: Number, default: 0},
  points: {type: Number, default: 0},
  recentEntries: {type: Array, default: []},
  earthEntryCount: {type: Number, default: 0},
  earthPoints: {type: Number, default: 0},
  earthEntries: {type: Array, default: []},
  animalEntryCount: {type: Number, default: 0},
  animalPoints: {type: Number, default: 0},
  animalEntries: {type: Array, default: []},
  humanityEntryCount: {type: Number, default: 0},
  humanityPoints: {type: Number, default: 0},
  humanityEntries: {type: Array, default: []},
  oceanEntryCount: {type: Number, default: 0},
  oceanPoints: {type: Number, default: 0},
  oceanEntries: {type: Array, default: []}
});
CountrySchema.set('timestamps', true);

CountrySchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('CountrySchema', CountrySchema);

