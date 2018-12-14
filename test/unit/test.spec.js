const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const TestingEnvironment = require('../../src/index');
const testData = require('./test-data');

describe('Testing missing parameters errors', () => {
  const dockerFiles = { missing: 'missing.docker-compose.yml', working: 'test.docker-compose.yml', corrupt: 'corrupt.docker-compose.yml' };
  const verifications = { working: { postgres: () => {}, node: () => {} }, notFunctions: { node: 3, postgres: true } };

  it('should throw missing parameter', () => {
    expect(() => {
      const test = new TestingEnvironment();
    }).to.throw();
    expect(() => {
      const test = new TestingEnvironment({ dockerComposeFileLocation: 2 });
    }).to.throw();
    expect(() => {
      const test = new TestingEnvironment({ dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.working });
    }).to.throw();
    expect(() => {
      const test = new TestingEnvironment({ verifications: 3 });
    }).to.throw();
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
    }).to.throw();
    expect(() => {
      const test = new TestingEnvironment({ verifications: verifications.working, dockerComposeFileLocation: __dirname, dockerFileName: dockerFiles.missing });
    }).to.throw();
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
});
