const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const TestingEnvironment = require('../../src/index');
const testData = require('./test-data');
const Errors = require('../../src/errors');

const dockerFiles = { missing: 'missing.docker-compose.yml',
  working: 'test.docker-compose.yml',
  corrupt: 'corrupt.docker-compose.yml',
  noVerifications: 'no-verifications.docker-compose.yml' };
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
    const test = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, enableLogs: undefined });
    expect(test.enableLogs).to.be.false;
    test.enableLogs = true;
    expect(test.enableLogs).to.be.true;

    const test2 = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, enableLogs: false });
    expect(test2.enableLogs).to.be.false;

    const test3 = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, enableLogs: 23 });
    expect(test3.enableLogs).to.be.true;

    const test4 = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, enableLogs: 'test' });
    expect(test4.enableLogs).to.be.true;

    const test5 = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working, enableLogs: null });
    expect(test5.enableLogs).to.be.false;
  });
  it('should handel missing verifications', () => {
    expect(() => {
      const test = new TestingEnvironment({ verifications: verifications.missing, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
    }).to.throw(Errors.MissingVerificationPromiseError);
    expect(() => {
      const test = new TestingEnvironment({ verifications: { node: verificationTypes.missing }, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
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
    expect(test.getService('node-test')).to.deep.equal(testData.servicesJson['node-test']);
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
