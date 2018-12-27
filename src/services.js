const buildServiceObjectFromJson = (serviceJson) => {
  const service = { ...serviceJson };
  if (serviceJson.ports) {
    service.ports = service.ports.map((port) => {
      if (typeof port == 'string') {
        const servicePorts = port.split(':');
        return { external: servicePorts[0], internal: servicePorts[1] };
      } if (typeof port == 'number') {
        return { external: undefined, internal: `${port}` };
      }
      return undefined;
    });
  }
  return service;
};

module.exports = { buildServiceObjectFromJson };
