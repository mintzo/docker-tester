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

class MissingVerificationPromiseError extends Error {
  constructor(verificationType) {
    super(`verification type '${verificationType}' , is missing a required promise function`);
  }
}


module.exports = {
  throwIf,
  MissingVariableError,
  MissingServicesInDockerComposeError,
  LoadingDockerComposeError,
  MissingVerificationTypeError,
  MissingVerificationPromiseError,
};
