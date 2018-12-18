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

const serviceJson = { 'test-postgres-db':
   { image: 'postgres:9.4',
     ports: ['5555:5432'],
     environment: { verificationType: 'postgres', POSTGRES_DB: 'test_db' } },
'node-test':
   { image: 'node',
     ports: [
       { exposed: '5005', inner: '5432' },
     ],
     environment: { verificationType: 'node' } },
'moore-nodejs-test':
   { image: 'node',
     restart: 'always',
     ports: [
       { exposed: '9994', inner: '5432' },
     ],
     environment: { verificationType: 'node' } } };

module.exports = { servicesJson, serviceJson };
