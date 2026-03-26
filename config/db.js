const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const env = require("./env");

const dbConfig = env.db;
let sequelize;

if (dbConfig.dialect === "sqlite") {
  // resuelve la ruta de sqlite
  const storagePath = path.resolve(process.cwd(), dbConfig.storage);
  // crea la carpeta si no existe
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });

  // conexion para sqlite
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: storagePath,
    logging: dbConfig.logging ? console.log : false
  });
} else {
  // conexion para otros motores
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging ? console.log : false
    }
  );
}

module.exports = sequelize;
