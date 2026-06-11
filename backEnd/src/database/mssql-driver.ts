import { config } from 'dotenv';
import mssql = require('mssql/msnodesqlv8');
import { buildSqlServerConnectionString } from './build-connection-string';

config();

const connectionString = buildSqlServerConnectionString();
const NativeConnectionPool = mssql.ConnectionPool;

class OdbcConnectionPool extends NativeConnectionPool {
  constructor(_config: unknown) {
    super({ connectionString });
  }
}

export const sqlServerDriver = {
  ...mssql,
  ConnectionPool: OdbcConnectionPool,
};
