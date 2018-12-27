const servicesJson = { 'test-postgres-db':
   { image: 'postgres:9.4',
     ports: ['5555:5432'],
     environment: { verificationType: 'postgres', POSTGRES_DB: 'test_db' } },
'node-test':
   { image: 'node',
     ports: ['5005:5432'],
     environment: { verificationType: 'node' } },
'moore-nodejs-test':
   { image: 'node',
     restart: 'always',
     ports: ['9994:5432'],
     environment: { verificationType: 'node' } } };

const serviceJson = { serviceTest1: { image: 'postgres:9.4',
  ports: [{ external: '5555', internal: '5432' }],
  environment: { POSTGRES_DB: 'test_db' } },
serviceTest2: { image: 'postgres:9.4',
  ports: [{ internal: '6515' }],
  environment: { POSTGRES_DB: 'test_db', verificationType: 'httpServer' } },

'test-postgres-db':
   { image: 'postgres:9.4',
     ports: ['5555:5432'],
     environment: { verificationType: 'postgres', POSTGRES_DB: 'test_db' } },
'node-test':
   { image: 'node',
     ports: [
       { external: '5005', internal: '5432' },
     ],
     environment: { verificationType: 'node' } },
'moore-nodejs-test':
   { image: 'node',
     restart: 'always',
     ports: [
       { external: '9994', internal: '5432' },
     ],
     environment: { verificationType: 'node' } } };

module.exports = { servicesJson, serviceJson };
