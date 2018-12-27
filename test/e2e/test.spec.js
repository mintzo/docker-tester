/* eslint-disable func-names */
/* eslint-disable global-require */
const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const axios = require('axios');
const TestingEnvironment = require('../../src/index');

const testingEnvironment = new TestingEnvironment({ dockerComposeFileLocation: __dirname,
  dockerFileName: 'test.docker-compose.yml',
  verifications: { httpServer: { promise: async (service) => {
    const port = service.ports[0].external;
    const healthCheckUrl = `http://localhost:${port}`;
    const result = await axios.get(healthCheckUrl);
    return result;
  },
  promiseRetryOptions: { retries: 5 } } } });

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


describe('testing environment', () => {
  it('should get ports', async () => {
    const service = await testingEnvironment.getActiveService('http-test');
    expect(service.ports[0]).to.deep.equal({ external: '7000', internal: '80' });
  });
  it('should get external port', async () => {
    const service = await testingEnvironment.getActiveService('http-test_6');
    expect(service.ports[0].internal).to.equal('80');
    expect(service.ports[0].external).to.exist;
    expect(service.ports[1].internal).to.equal('4444');
    expect(service.ports[1].external).to.exist;
  });
});
