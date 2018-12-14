const dockerCompose = require('docker-compose');
// const promiseRetry = require('promise-retry');
const yaml = require('yamljs');

const Errors = require('./errors');
const inputValidations = require('./input-validation');

module.exports = class TestingEnvironment {
  constructor({ dockerComposeFileLocation, dockerFileName, verifications, enableLogs }) {
    this.enableLogs = !!enableLogs || false;
    this.defaultPromiseRetryOptions = { retries: 5 };
    inputValidations.requiredFields({ dockerComposeFileLocation, dockerFileName, verifications });

    this.dockerComposeFileLocation = dockerComposeFileLocation;
    this.dockerFileName = dockerFileName;
    this.verifications = verifications;

    this.dockerComposeOptions = { cwd: dockerComposeFileLocation };
    try { this.dockerComposeFileJson = yaml.load(`${dockerComposeFileLocation}/${dockerFileName}`); } catch (error) {
      throw new Errors.LoadingDockerComposeError(`${dockerComposeFileLocation}/${dockerFileName}`, error);
    }
    inputValidations.checkServicesDefinition({ services: this.services, verifications: this.verifications, dockerComposeFileJson: this.dockerComposeFileJson });
    inputValidations.checkVerifications({ verifications: this.verifications });
  }

  get services() { return this.dockerComposeFileJson.services; }

  getService(serviceName) {
    Errors.throwIf(this.services[serviceName], new Errors.MissingServiceError(serviceName));
    return this.services[serviceName];
  }

  getVerificationPromise({ serviceName }) {
    Errors.throwIf(this.getService(serviceName).environment && this.getService(serviceName).environment.verificationType, new Errors.MissingVerificationError(serviceName));
    const { verificationType } = this.getService(serviceName).environment;
    return this.verifications[verificationType].promise;
  }

  /* istanbul ignore next */
  log(whatToLog) { if (this.enableLogs) { console.log(`Docker-Testing - ${whatToLog}`); } }


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
