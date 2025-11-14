const { Client } = require("pg");

async function createSchema() {
  const client = new Client({
    user: "postgres",
    host: "localhost",
    password: "123",
    database: "launchstoredb"
  });

  await client.connect();

  // NÃO DROPAMOS O SCHEMA PÚBLICO
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS public;
  `);

  await client.end();
}

module.exports = createSchema;
