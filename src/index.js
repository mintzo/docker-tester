const promiseRetry = require('promise-retry');
const yaml = require('yamljs');

const DockerCompose = require('./docker-compose');
const Errors = require('./errors');
const inputValidations = require('./input-validation');
const { buildServiceObjectFromJson } = require('./services');

module.exports = class TestingEnvironment {
  constructor({ dockerComposeFileLocation, dockerFileName, verifications, disableLogs }) {
    this.disableLogs = !!disableLogs || false;
    this.defaultPromiseRetryOptions = { retries: 4 };
    inputValidations.requiredFields({ dockerComposeFileLocation, dockerFileName, verifications });
    this.dockerCompose = new DockerCompose(`${dockerComposeFileLocation}/${dockerFileName}`);
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

  /* istanbul ignore next */
  log(whatToLog) { if (!this.disableLogs) { console.log(`Docker-Testing - ${whatToLog}`); } }

  get services() { return this.dockerComposeFileJson.services; }

  get serviceNames() { return Object.keys(this.services); }

  getService(serviceName) {
    Errors.throwIf(this.services[serviceName], new Errors.MissingServiceError(serviceName));
    return buildServiceObjectFromJson(this.services[serviceName]);
  }

  async getActiveService(serviceName) {
    const service = this.getService(serviceName);
    service.ports = await Promise.all(service.ports.map(async (port) => {
      if (port.external) { return port; }
      return { ...port, external: await this.dockerCompose.getExternalPort(serviceName, port.internal) };
    }));
    return service;
  }

  getServiceVerificationType(serviceName) {
    Errors.throwIf(this.getService(serviceName).environment && this.getService(serviceName).environment.verificationType, new Errors.MissingVerificationError(serviceName));
    const { verificationType } = this.getService(serviceName).environment;
    return verificationType;
  }

  getVerificationPromise({ serviceName }) { return this.verifications[this.getServiceVerificationType(serviceName)].promise; }

  getRetryOptions({ serviceName }) {
    if (this.verifications[this.getServiceVerificationType(serviceName)].promiseRetryOptions) {
      return { ...this.defaultPromiseRetryOptions, ...(this.verifications[this.getServiceVerificationType(serviceName)].promiseRetryOptions) };
    }
    return { ...this.defaultPromiseRetryOptions };
  }

  async verifyServiceIsReady({ serviceName }) {
    this.log(`Verifying the service '${serviceName}' is up`);
    try {
      const verificationPromise = this.getVerificationPromise({ serviceName });
      await promiseRetry(async (retry, attemptNumber) => {
        this.log(`trying to verify if service '${serviceName} is up. (attempt number ${attemptNumber})`);
        return verificationPromise(await this.getActiveService(serviceName)).catch(retry);
      }, this.getRetryOptions({ serviceName }));
    } catch (error) {
      if (!(error instanceof Errors.MissingVerificationError)) {
        throw new Errors.CannotVerifyServiceIsUpError(serviceName, error);
      }
    }
  }

  async verifyAllServices() {
    return Promise.all(this.serviceNames.map(serviceName => this.verifyServiceIsReady({ serviceName })));
  }

  /* istanbul ignore next */
  async stop() {
    this.log('stopping all services');
    await this.dockerCompose.down(this.dockerComposeOptions);
  }

  /* istanbul ignore next */
  async start({ stopIfUp, verifyUp } = { stopIfUp: true, verifyUp: true }) {
    if (stopIfUp) { await this.stop(); }

    this.log(`starting services from docker-compose ${this.dockerComposeOptions.cwd}/${this.dockerFileName}`);
    await this.dockerCompose.upAll(this.dockerComposeOptions);

    if (verifyUp) { await this.verifyAllServices(); }
  }
};
