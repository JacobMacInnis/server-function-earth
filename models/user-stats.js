'use strict';
const mongoose = require('mongoose');

const userStats = new mongoose.Schema({
  userId:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
  username: {type: String, required: true },
  country: {type: String, required: true},
  state: { type: String, required: true },
  city: { type: String, required: true },
  earthEntries: {type: Array},
  earthEntriesCount :{type: Number, default: 0},
  earthPoints: {type: Number, default: 0},
  oceanEntries: {type: Array },
  oceanEntriesCount :{type: Number, default: 0},
  oceanPoints: {type: Number, default: 0},
  animalsEntries: {type: Array},
  animalEntriesCount:{type: Number, default: 0},
  animalPoints: {type: Number, default: 0},
  humanityEntries: {type: Array},
  humanityEntriesCount:{type: Number, default: 0},
  humanityPoints: {type: Number, default: 0},
  totalEntries: {type: Number, default: 0},
  totalPoints: {type: Number, default: 0},
  recentEntries:{type:Array, default: []},
  head:{type:Number}
});
userStats.set('timestamps', true);

userStats.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('UserStats', userStats);