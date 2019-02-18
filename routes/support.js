'use strict';
const express = require('express');

const router = express.Router();

const { MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE } = require('../config');


router.post('/', (req, res, next) => {
  const { fullName, email, phone, service, message } = req.body; 
  const requiredFields = ['fullName', 'email', 'service', 'message'];
  const missingField = requiredFields.find(field => !(field in req.body));
  
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing '${missingField}' in request body`,
      location: missingField
    });
  }
  const mailjet = require ('node-mailjet')
    .connect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);
  const request = mailjet
    .post('send', {'version': 'v3.1'})
    .request({
      'Messages':[
        {
          'From': {
            'Email': 'support@functionearth.com',
            'Name': 'Mailjet Pilot'
          },
          'To': [
            {
              'Email': 'support@functionearth.com',
              'Name': 'passenger 1'
            }
          ],
          'Subject': 'New FE Support Message',
          'TextPart': message,
          'HTMLPart': `<h3>Function Earth Support Message</h3><br /><h4>Name:${fullName}</h4><br /><p>Email: ${email}</p><br/><p>${service}</p><br /><p>Phone: ${phone}</p><br /><p>${message}</p>`
        }
      ]
    });
  request
    .then((result) => {
      res.json('Success');
    })
    .catch((err) => {
      next(err);
    });
});


module.exports = router;