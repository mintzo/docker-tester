/* eslint-disable prefer-promise-reject-errors */
const chai = require('chai');
const sandbox = require('sinon').createSandbox();
chai.use(require('chai-as-promised'));

const { expect } = chai;

const TestingEnvironment = require('../../src/index');
const testData = require('./test-data');
const Errors = require('../../src/errors');

const dockerFiles = {
  missing: 'missing.docker-compose.yml',
  working: 'test.docker-compose.yml',
  corrupt: 'corrupt.docker-compose.yml',
  noVerifications: 'no-verifications.docker-compose.yml',
  services: 'services.yml',
  mixed: 'mixed.yml',
};
const verificationTypes = { simple: { promise: () => {} }, missing: { property: true }, notFunctions: { promise: true } };
const verifications = { working: { postgres: verificationTypes.simple, node: verificationTypes.simple },
  notFunctions: { node: verificationTypes.notFunctions },
  missing: { postgres: verificationTypes.missing, node: verificationTypes.missing } };

describe('Testing missing parameters errors', () => {
  it('should throw missing parameter', () => {
    expect(() => {
      const test = new TestingEnvironment();
    }).to.throw();
    expect(() => {
      const test = new TestingEnvironment({ dockerComposeFileLocation: 2 });
    }).to.throw(Errors.MissingVariableError);
    expect(() => {
      const test = new TestingEnvironment({ dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
    }).to.throw(Errors.MissingVariableError);
    expect(() => {
      const test = new TestingEnvironment({ verifications: 3 });
    }).to.throw(Errors.MissingVariableError);
  });
  it('should construct correctly', () => {
    expect(() => {
      const test = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
    }).to.not.throw();
  });
  it('should get services', () => {
    const test = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
    expect(test.services).to.deep.equal(testData.servicesJson);
  });
  it('should handel corrupt docker files', () => {
    expect(() => {
      const test = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.corrupt });
    }).to.throw(Errors.LoadingDockerComposeError);
    expect(() => {
      const test = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.missing });
    }).to.throw(Errors.MissingServicesInDockerComposeError);
  });
  it('should handel logEnabled', () => {
    const test = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, disableLogs: undefined });
    expect(test.disableLogs).to.be.false;
    test.disableLogs = true;
    expect(test.disableLogs).to.be.true;

    const test2 = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, disableLogs: false });
    expect(test2.disableLogs).to.be.false;

    const test3 = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, disableLogs: 23 });
    expect(test3.disableLogs).to.be.true;

    const test4 = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, disableLogs: 'test' });
    expect(test4.disableLogs).to.be.true;

    const test5 = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, disableLogs: null });
    expect(test5.disableLogs).to.be.false;
  });
  it('should handel missing verifications', () => {
    expect(() => {
      const test = new TestingEnvironment({ verifications: verifications.missing, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, disableLogs: true });
    }).to.throw(Errors.MissingVerificationPromiseError);
    expect(() => {
      const test = new TestingEnvironment({ verifications: { node: verificationTypes.missing }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, disableLogs: true });
    }).to.throw(Errors.MissingVerificationTypeError);
  });
});

describe('getService', () => {
  it('should handel missing service', () => {
    const test = new TestingEnvironment({ verifications: { ...verifications.working, node: { promise: 42 } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
    expect(() => test.getService('nonExisting')).to.throw(Errors.MissingServiceError);
  });

  it('should get service', () => {
    const test = new TestingEnvironment({ verifications: { ...verifications.working, node: { promise: 42 } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
    expect(test.getService('node-test')).to.deep.equal(testData.serviceJson['node-test']);
  });
});

describe('getVerificationPromise', () => {
  it('should handel missing verifications', () => {
    const test = new TestingEnvironment({ verifications: {}, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.noVerifications });
    expect(() => test.getVerificationPromise({ serviceName: 'test' })).to.throw(Errors.MissingVerificationError);
  });

  it('should handel missing service', () => {
    const test = new TestingEnvironment({ verifications: { ...verifications.working, node: { promise: 42 } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
    expect(() => test.getVerificationPromise({ serviceName: 'test' })).to.throw(Errors.MissingServiceError);
  });

  it('should get verification promise', () => {
    const test = new TestingEnvironment({ verifications: { ...verifications.working, node: { promise: 42 } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
    expect(test.getVerificationPromise({ serviceName: 'node-test' })).to.equal(42);
  });
});

const promiseRetryOptions = { retries: 0 };
describe('verifyServiceIsReady', () => {
  it('should handel no verifications services', async () => {
    const test = new TestingEnvironment({ verifications: { httpServer: { promise: () => Promise.resolve() } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.mixed, disableLogs: true });
    await test.verifyServiceIsReady({ serviceName: 'test' });
    await test.verifyServiceIsReady({ serviceName: 'test2' });
  });
  it('should reject a service that is down', async () => {
    const test = new TestingEnvironment({ verifications: { httpServer: { promise: () => Promise.reject('cant'), promiseRetryOptions } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.mixed, disableLogs: true });
    await expect(test.verifyServiceIsReady({ serviceName: 'test3' })).to.eventually.be.rejectedWith(Errors.CannotVerifyServiceIsUpError);
  });
  it('should wait for service', async () => {
    const test = new TestingEnvironment({ verifications: { httpServer: { promise: () => Promise.resolve() } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.mixed, disableLogs: true });
    await test.verifyServiceIsReady({ serviceName: 'test3' });
  });
});
describe('verifyAllServices', () => {
  it('should handel no verifications services', async () => {
    const test = new TestingEnvironment({ verifications: { httpServer: { promise: () => Promise.resolve() } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.mixed, disableLogs: true });
    await test.verifyAllServices();
  });
});
describe('buildServiceObjectFromJson', () => {
  it('should build services', async () => {
    const test = new TestingEnvironment({ verifications: { httpServer: { promise: () => Promise.resolve() } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.services, disableLogs: true });
    expect(test.getService('test')).to.deep.equal(testData.serviceJson.serviceTest1);
  });
  it('should build service with no ports', async () => {
    const test = new TestingEnvironment({ verifications: { httpServer: { promise: () => Promise.resolve() } }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.services, disableLogs: true });
    const service = test.getService('test3');
    delete service.ports[0].external;
    expect(service).to.deep.equal(testData.serviceJson.serviceTest2);
  });
});
describe('getActiveService', () => {
});
