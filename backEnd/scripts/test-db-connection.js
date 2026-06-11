const tedious = require('mssql');
const native = require('mssql/msnodesqlv8');

const odbc =
  'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=Shidohim;Trusted_Connection=yes;TrustServerCertificate=yes;';

async function run() {
  try {
    const pool = await native.connect({ connectionString: odbc });
    const result = await pool.request().query('SELECT 1 AS ok');
    await pool.close();
    console.log('native SUCCESS', result.recordset[0]);
  } catch (e) {
    console.log('native FAILED', e.message);
  }

  try {
    const pool = await tedious.connect({
      connectionString: odbc,
      options: { encrypt: false, trustServerCertificate: true },
    });
    const result = await pool.request().query('SELECT 1 AS ok');
    await pool.close();
    console.log('tedious SUCCESS', result.recordset[0]);
  } catch (e) {
    console.log('tedious FAILED', e.message);
  }
}

run();
