const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const TestingEnvironment = require('../../src/index');

describe('Testing missing parameters errors', () => {
  it('should throw missing parameter', () => {
    expect(() => {
      const test = new TestingEnvironment();
    }).to.throw();
    expect(() => {
      const test = new TestingEnvironment({ dockerComposeFileLocation: 2 });
    }).to.throw();
    expect(() => {
      const test = new TestingEnvironment({ dockerComposeFileLocation: __dirname, dockerFileName: 'test.docker-compose.yml' });
    }).to.throw();
    expect(() => {
      const test = new TestingEnvironment({ verifications: 3 });
    }).to.throw();
  });
  it('should construct correctly', () => {
    expect(() => {
      const test = new TestingEnvironment({ verifications: 3, dockerComposeFileLocation: __dirname, dockerFileName: 'test.docker-compose.yml' });
    }).to.not.throw();
  });
  const servicesTest = { 'test-postgres-db': { environment: { POSTGRES_DB: 'test_db', verificationType: 'postgres' }, image: 'postgres:9.4', ports: ['5555:5432'] } };
  it('should get services', () => {
    const test = new TestingEnvironment({ verifications: 3, dockerComposeFileLocation: __dirname, dockerFileName: 'test.docker-compose.yml' });
    expect(test.services).to.deep.equal(servicesTest);
  });
  it('should handel corrupt docker files', () => {
    expect(() => {
      const test = new TestingEnvironment({ verifications: 3, dockerComposeFileLocation: __dirname, dockerFileName: 'corrupt.docker-compose.yml' });
    }).to.throw();
  });
  it('should handel logEnabled', () => {
    const test = new TestingEnvironment({ verifications: 3, dockerComposeFileLocation: __dirname, dockerFileName: 'test.docker-compose.yml', enableLogs: undefined });
    expect(test.enableLogs).to.be.false;
    test.enableLogs = true;
    expect(test.enableLogs).to.be.true;

    const test2 = new TestingEnvironment({ verifications: 3, dockerComposeFileLocation: __dirname, dockerFileName: 'test.docker-compose.yml', enableLogs: false });
    expect(test2.enableLogs).to.be.false;

    const test3 = new TestingEnvironment({ verifications: 3, dockerComposeFileLocation: __dirname, dockerFileName: 'test.docker-compose.yml', enableLogs: 23 });
    expect(test3.enableLogs).to.be.true;

    const test4 = new TestingEnvironment({ verifications: 3, dockerComposeFileLocation: __dirname, dockerFileName: 'test.docker-compose.yml', enableLogs: 'test' });
    expect(test4.enableLogs).to.be.true;

    const test5 = new TestingEnvironment({ verifications: 3, dockerComposeFileLocation: __dirname, dockerFileName: 'test.docker-compose.yml', enableLogs: null });
    expect(test5.enableLogs).to.be.false;
  });
});
