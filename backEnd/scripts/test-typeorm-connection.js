const { DataSource } = require('typeorm');

const configs = [
  {
    name: 'host instance + default auth',
    options: {
      type: 'mssql',
      host: 'localhost\\SQLEXPRESS',
      database: 'Shidohim',
      authentication: { type: 'default' },
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
      entities: [],
      synchronize: false,
    },
  },
  {
    name: 'extra connectionString only fields',
    options: {
      type: 'mssql',
      host: 'localhost\\SQLEXPRESS',
      database: 'Shidohim',
      username: '',
      password: '',
      extra: {
        connectionString:
          'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=Shidohim;Trusted_Connection=yes;TrustServerCertificate=yes;',
      },
      entities: [],
      synchronize: false,
    },
  },
];

async function run() {
  for (const { name, options } of configs) {
    const dataSource = new DataSource(options);
    try {
      await dataSource.initialize();
      const result = await dataSource.query('SELECT DB_NAME() AS db');
      console.log(`SUCCESS: ${name} ->`, result[0]);
      await dataSource.destroy();
      return;
    } catch (error) {
      console.log(`FAILED: ${name} -> ${error.message}`);
    }
  }
}

run();
