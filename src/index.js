const assert = require('assert');
const dockerCompose = require('docker-compose');
// const promiseRetry = require('promise-retry');
const yaml = require('yamljs');

// const verificationTypes = {
//   postgres: 'postgres',
// };

const missingVariableMessage = variableName => `Missing required variable name ${variableName}`;

module.exports = class TestingEnvironment {
  constructor({ dockerComposeFileLocation, dockerFileName, verifications, enableLogs }) {
    this.enableLogs = !!enableLogs || false;
    assert(dockerComposeFileLocation, missingVariableMessage('dockerComposeFileLocation'));
    this.dockerComposeFileLocation = dockerComposeFileLocation;

    assert(dockerFileName, missingVariableMessage('dockerFileName'));
    this.dockerFileName = dockerFileName;

    assert(verifications, missingVariableMessage('verifications'));
    this.verifications = verifications;

    this.dockerComposeOptions = { cwd: dockerComposeFileLocation };
    try {
      this.dockerComposeFileJson = yaml.load(`${dockerComposeFileLocation}/${dockerFileName}`);
      assert(this.dockerComposeFileJson.services, `${missingVariableMessage('services')}, in the docker-compose file`);
    } catch (error) {
      throw new Error(`Cannot load docker-compose file , ${dockerComposeFileLocation}/${dockerFileName}} \n Error: ${error}`);
    }
    this.checkServicesDefinition();
  }

  get services() {
    return this.dockerComposeFileJson.services;
  }

  /* istanbul ignore next */
  log(whatToLog) { if (this.enableLogs) { console.log(`Docker-Testing - ${whatToLog}`); } }

  checkServicesDefinition() {
    Object.keys(this.services).forEach((serviceName) => {
      const { verificationType } = this.services[serviceName].environment;
      assert(this.verifications[verificationType], `verification type '${verificationType}' , was not sent in the constructor correctly`);
    });
  }

  // async verifyServiceIsReady({ serviceName, verificationPromise }) {
  //   console.log(`varifing ${serviceName} is up`);
  //   try {
  //     await promiseRetry((retry, number) => {
  //       console.log('attempt number', number);
  //       return verificationPromise().catch(retry);
  //     }, { retries: 4 });
  //   } catch (error) {
  //     console.error(error);
  //     throw new Error(`Cannot verify that service '${serviceName}' is up using the verification promise`);
  //   }
  // }

  // async verifyAllServices() {
  //   const servicesVerificationPromises = Object.keys(this.services).map((serviceName) => {
  //     if (this.services[serviceName].environment.verification) {
  //       return this.verifyServiceIsReady({ serviceName, verificationPromise: this.servicesVerificationTests.postgres });
  //     }
  //     return Promise.resolve();
  //   });
  //   return Promise.resolve();
  //   // return Promise.all(servicesVerificationPromises);
  // }

  /* istanbul ignore next */
  async stop() {
    this.log('stopping all services');
    await dockerCompose.down(this.dockerComposeOptions);
  }

  /* istanbul ignore next */
  async start({ stopIfUp, verifyUp }) {
    if (stopIfUp) { await this.stop(); }

    this.log(`starting services from docker-compose ${this.dockerFileName}`);
    await dockerCompose.upAll(this.dockerComposeOptions);

    if (verifyUp) { await this.verifyAllServices(); }
  }
};
