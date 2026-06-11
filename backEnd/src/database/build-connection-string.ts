export function buildSqlServerConnectionString(): string {
  const server = process.env.DB_SERVER ?? 'localhost\\SQLEXPRESS';
  const database = process.env.DB_NAME ?? 'Shidohim';
  const driver = process.env.DB_ODBC_DRIVER ?? 'ODBC Driver 18 for SQL Server';
  const trustedConnection = process.env.DB_TRUSTED_CONNECTION !== 'false';

  if (trustedConnection) {
    return (
      `Driver={${driver}};` +
      `Server=${server};` +
      `Database=${database};` +
      `Trusted_Connection=yes;` +
      `TrustServerCertificate=yes;`
    );
  }

  const username = process.env.DB_USERNAME ?? '';
  const password = process.env.DB_PASSWORD ?? '';

  return (
    `Driver={${driver}};` +
    `Server=${server};` +
    `Database=${database};` +
    `UID=${username};` +
    `PWD=${password};` +
    `TrustServerCertificate=yes;`
  );
}
