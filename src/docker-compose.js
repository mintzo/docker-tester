const { exec } = require('child_process');

module.exports = class DockerCompose {
  constructor(dockerComposeFilePath, enableLog = false) {
    this.dockerComposeFilePath = dockerComposeFilePath;
    this.enableLog = enableLog;
  }

  async down() {
    return this.execComposeCommand('down --remove-orphans');
  }

  async upAll() {
    return this.execComposeCommand('up -d');
  }

  execComposeCommand(command) {
    return new Promise((resolve, reject) => {
      const composeCommand = `docker-compose -f ${this.dockerComposeFilePath} ${command}`;
      exec(composeCommand, (error, stdout, stderr) => {
        if (this.enableLog) { console.log({ error, stdout, stderr }); }
        if (error) { reject(error); } else { resolve(); }
      });
    });
  }
};
