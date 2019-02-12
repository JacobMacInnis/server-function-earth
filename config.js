'use strict';
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://mkqnoikarlerolrs:p7hbol504axbzudg@ds133095-a0.mlab.com:33095,ds133095-a1.mlab.com:33095/functionearth?replicaSet=rs-ds133095';
  // 'mongodb://localhost/function-earth',
  //'mongodb://mkqnoikarlerolrs:p7hbol504axbzudg@ds243963.mlab.com:43963/function-earth',

  
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost/function-earth-test',
  CLIENT_ORIGIN: process.env.NODE_ENV || 'http://localhost:3000' || 'http://10.1.10.156:19001' || 'http://localhost:19000',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
};


//'mongodb://mkqnoikarlerolrs:p7hbol504axbzudg@ds133095-a0.mlab.com:33095,ds133095-a1.mlab.com:33095/functionearth?replicaSet=rs-ds133095';