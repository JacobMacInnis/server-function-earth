'use strict';
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/functionearth',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost/functionearth-test',
  CLIENT_ORIGIN: process.env.NODE_ENV || 'http://localhost:3000' || 'http://10.1.10.156:19001',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
};