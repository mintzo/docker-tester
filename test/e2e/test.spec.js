/* eslint-disable func-names */
/* eslint-disable global-require */
const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const axios = require('axios');
const TestingEnvironment = require('../../src/index');

const testingEnvironment = new TestingEnvironment({ dockerComposeFileLocation: __dirname,
  dockerFileName: 'test.docker-compose.yml',
  verifications: { httpServer: { promise: async (service) => {
    const port = service.ports[0].exposed;
    const healthCheckUrl = `http://localhost:${port}`;
    const result = await axios.get(healthCheckUrl);
    return result;
  },
  promiseRetryOptions: { retries: 4 } } } });

before(async function () {
  this.timeout(0);
  await testingEnvironment.start();
});

require('./sample-tests');

after(async function () {
  this.timeout(0);
  await testingEnvironment.stop();
});

describe('Simple Usage', () => {
  it('some tests', () => {
    expect(true).to.be.true;
  });
});
