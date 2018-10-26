'use strict';

const mongoose = require('mongoose');

const usLocationSchema = new mongoose.Schema({
  zip_code: { type: Number },
  latitude : { type: Number },
  longitude: { type: Number },
  city: { type: String },
  state: { type: String }
});

module.exports = mongoose.model('USLocation', usLocationSchema);