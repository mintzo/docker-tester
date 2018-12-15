/* eslint-disable func-names */
/* eslint-disable global-require */
const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const axios = require('axios');
const TestingEnvironment = require('../../src/index');
const Errors = require('../../src/errors');

const testingEnvironment = new TestingEnvironment({ enableLogs: true,
  dockerComposeFileLocation: `${__dirname}`,
  dockerFileName: 'test.docker-compose.yml',
  verifications: { httpServer: { promise: async (service) => {
    const port = service.ports[0].split(':')[0];
    const healthCheckUrl = `http://localhost:${port}`;
    const result = await axios.get(healthCheckUrl);
    return result;
  },
  promiseRetryOptions: { retries: 4 } } } });

(async () => {
  const results = await testingEnvironment.start({ stopIfUp: true, verifyUp: true });
  require('./sample-tests');
  run();
})();

after(async function () {
  this.timeout(0);
  await testingEnvironment.stop();
});

describe('Simple Usage', () => {
  it('some tests', () => {
    expect(true).to.be.true;
  });
});
