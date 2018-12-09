'use strict';

const mongoose = require('mongoose');

const TopUserSchema = new mongoose.Schema({
  topUsers: {type: Array, default: []},
  topEarthUsers: {type: Array, default: []},
  topOceanUsers: {type: Array, default: []},
  topAnimalUsers: {type: Array, default: []},
  topHumanityUsers: {type: Array, default: []}
});
TopUserSchema.set('timestamps', true);

TopUserSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('TopUserSchema', TopUserSchema);