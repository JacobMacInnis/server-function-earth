'use strict';

// Clear the console before each run
// process.stdout.write("\x1Bc\n");

const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../app');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality Check', () => {

  it('true should be true', () => {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', () => {
    expect(2 + 2).to.equal(4);
  });
});

describe('Environment', () => {

  it('NODE_ENV should be "test"', () => {
    expect(process.env.NODE_ENV).to.equal('test');
  });

});

describe('Basic Express setup', () => {

  describe('Express static', () => {

    it('GET request "api/test" should return the index page', () => {
      return chai.request(app)
        .get('/api/test')
        .then(function (res) {
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          expect(res.text).to.be.an('string');
          expect(res.text).to.equal('Hello World!');
        });
    });

  });

  describe('404 handler', () => {

    it('should respond with 404 when given a bad path', () => {
      return chai.request(app)
        .get('/bad/path')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });
});