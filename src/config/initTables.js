const { Client } = require("pg");

async function initTables() {
  const client = new Client({
    user: "postgres",
    host: "localhost",
    password: "123",
    database: "launchstoredb",
  });

  await client.connect();
  console.log("🔧 Criando/verificando tabelas...");

  // ---------------------------------------------------------------
  // TABELAS
  // ---------------------------------------------------------------
  await client.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      cpf_cnpj TEXT UNIQUE NOT NULL,
      cep TEXT,
      address TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      category_id INT NOT NULL,
      user_id INT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      old_price INT,
      price INT NOT NULL,
      quantity INT DEFAULT 0,
      status INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      name TEXT,
      path TEXT NOT NULL,
      product_id INT
    );

    CREATE TABLE IF NOT EXISTS session (
      sid VARCHAR PRIMARY KEY,
      sess JSON NOT NULL,
      expire TIMESTAMP NOT NULL
    );
  `);

  // ---------------------------------------------------------------
  // FOREIGN KEYS & INDEXES
  // ---------------------------------------------------------------
  await client.query(`
    ALTER TABLE products
      DROP CONSTRAINT IF EXISTS products_category_id_fkey,
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES categories(id);

    ALTER TABLE products
      DROP CONSTRAINT IF EXISTS products_user_id_fkey,
      ADD CONSTRAINT products_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;

    ALTER TABLE files
      DROP CONSTRAINT IF EXISTS files_product_id_fkey,
      ADD CONSTRAINT files_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id)
      ON DELETE CASCADE;

    CREATE INDEX IF NOT EXISTS IDX_session_expire
      ON session(expire);
  `);

  // ---------------------------------------------------------------
  // TRIGGER FUNCTION
  // ---------------------------------------------------------------
  await client.query(`
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ---------------------------------------------------------------
  // TRIGGERS
  // ---------------------------------------------------------------
  await client.query(`
    DROP TRIGGER IF EXISTS set_timestamp ON users;
    CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

    DROP TRIGGER IF EXISTS set_timestamp ON products;
    CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
  `);

  // ---------------------------------------------------------------
  // SEEDS (somente se não existir)
  // ---------------------------------------------------------------
  console.log("🌱 Inserindo seeds...");

  await client.query(`
    INSERT INTO categories (name) VALUES
      ('comida'),
      ('eletrônicos'),
      ('automóveis')
    ON CONFLICT (name) DO NOTHING;
  `);

  // ---------------------------------------------------------------
  // CLEAN TABLES
  // ---------------------------------------------------------------
  await client.query(`
    DELETE FROM products;
    DELETE FROM users;
    DELETE FROM files;
  `);

  // ---------------------------------------------------------------
  // RESET SEQUENCES
  // ---------------------------------------------------------------
  await client.query(`
    ALTER SEQUENCE products_id_seq RESTART WITH 1;
    ALTER SEQUENCE users_id_seq RESTART WITH 1;
    ALTER SEQUENCE files_id_seq RESTART WITH 1;
  `);

  console.log("🎉 Banco configurado com sucesso!");
  await client.end();
}

module.exports = initTables;
