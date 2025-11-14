const express = require('express');
const nunjucks = require('nunjucks');
const routes = require('./routes');
const methodOverride = require('method-override');
const session = require('./config/session');

const createDatabase = require("./config/initDatabase");
const createSchema = require("./config/createSchema");
const createTables = require("./config/initTables");

const server = express();

async function startServer() {
  try {
    console.log("🔄 Criando/verificando banco de dados...");
    await createDatabase();

    console.log("📦 Criando/verificando schema...");
    await createSchema();

    console.log("📑 Criando/verificando tabelas...");
    await createTables();

    console.log("🚀 Iniciando servidor...");

    server.use(session);
    server.use((req, res, next) => {
      res.locals.session = req.session;
      next();
    });

    server.use(express.urlencoded({ extended: true }));
    server.use(express.static('public'));
    server.use(methodOverride('_method'));
    server.use(routes);

    server.set("view engine", "njk");

    nunjucks.configure("src/app/views", {
      express: server,
      autoescape: false,
      noCache: true
    });

    server.listen(5000, () =>
      console.log('🔥 Server rodando na porta 5000!')
    );

  } catch (err) {
    console.error("❌ Erro ao iniciar:", err);
  }
}

startServer();
