const Errors = require('./errors');

const requiredFields = ({ dockerComposeFileLocation, dockerFileName, verifications }) => {
  Errors.throwIf(dockerComposeFileLocation, new Errors.MissingVariableError('dockerComposeFileLocation'));
  Errors.throwIf(dockerFileName, new Errors.MissingVariableError('dockerFileName'));
  Errors.throwIf(verifications, new Errors.MissingVariableError('verifications'));
};

const checkServicesDefinition = ({ services, verifications, dockerComposeFileJson }) => {
  Errors.throwIf(dockerComposeFileJson.services, new Errors.MissingServicesInDockerComposeError());
  Object.keys(services).forEach((serviceName) => {
    const { verificationType } = services[serviceName].environment;
    Errors.throwIf(verifications[verificationType], new Errors.MissingVerificationTypeError(verificationType));
  });
};

const checkVerifications = ({ verifications }) => {
  Object.keys(verifications).forEach((verificationType) => {
    Errors.throwIf(verifications[verificationType].promise, new Errors.MissingVerificationPromiseError(verificationType));
  });
};

module.exports = { requiredFields, checkServicesDefinition, checkVerifications };
