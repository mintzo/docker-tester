const buildServiceObjectFromJson = (serviceJson) => {
  const service = { ...serviceJson };
  if (serviceJson.ports) {
    service.ports = service.ports.map((port) => {
      const servicePorts = port.split(':');
      return { exposed: servicePorts[0], inner: servicePorts[1] };
    });
  }
  return service;
};

module.exports = { buildServiceObjectFromJson };
