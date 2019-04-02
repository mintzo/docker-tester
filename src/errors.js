const throwIf = (booleanToCheck, errorToThrow) => {
  if (!booleanToCheck) { throw errorToThrow; }
};

class MissingVariableError extends Error {
  constructor(variableName) {
    super(`Missing required variable name ${variableName}`);
  }
}

class MissingServicesInDockerComposeError extends Error {
  constructor() {
    super('Missing required variable name \'services\', in the docker-compose file');
  }
}

class LoadingDockerComposeError extends Error {
  constructor(filePath, error) {
    super(`Cannot load docker-compose file , ${filePath}} \n Error: ${error}`);
  }
}

class MissingVerificationTypeError extends Error {
  constructor(verificationType) {
    super(`verification type '${verificationType}' , was not sent in the constructor correctly`);
  }
}

class MissingVerificationPFunctionError extends Error {
  constructor(verificationType) {
    super(`verification type '${verificationType}' , is missing a required 'verificationFunction' function`);
  }
}

class MissingVerificationError extends Error {
  constructor(serviceName) {
    super(`verification was not set for the service: ${serviceName}`);
  }
}

class MissingServiceError extends Error {
  constructor(serviceName) {
    super(`the service: ${serviceName}, was not defined in the docker compose file`);
  }
}

class CannotVerifyServiceIsUpError extends Error {
  constructor(serviceName, error) {
    super(`Cannot verify that service '${serviceName}' is up using the verification promise \n\n Error: ${error}`);
  }
}

module.exports = {
  throwIf,
  MissingVariableError,
  MissingServicesInDockerComposeError,
  LoadingDockerComposeError,
  MissingVerificationTypeError,
  MissingVerificationPFunctionError,
  MissingVerificationError,
  MissingServiceError,
  CannotVerifyServiceIsUpError,
};
