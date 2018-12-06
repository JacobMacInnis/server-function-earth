'use strict';

const mongoose = require('mongoose');


const OceanSchema = new mongoose.Schema({
  ocean: {type: String},
  entryCount: {type: Number, default: 0},
  points: {type: Number, default: 0},
  entries: {type: Array, default: []}
});
OceanSchema.set('timestamps', true);

OceanSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('OceanSchema', OceanSchema);