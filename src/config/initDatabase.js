const { Client } = require("pg");

async function initDatabase() {
  // conecta ao banco postgres (admin)
  const adminClient = new Client({
    user: "postgres",
    host: "localhost",
    password: "123",
    database: "postgres",
  });

  await adminClient.connect();

  const dbName = "launchstoredb";

  // verifica se o banco existe
  const exists = await adminClient.query(
    `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
  );

  if (exists.rowCount === 0) {
    console.log("Criando banco de dados:", dbName);
    await adminClient.query(`CREATE DATABASE ${dbName}`);
  }

  await adminClient.end();
}

module.exports = initDatabase;
