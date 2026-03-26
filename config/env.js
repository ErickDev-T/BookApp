const path = require("path");
const dotenv = require("dotenv");

// entorno activo
const nodeEnv = process.env.NODE_ENV || "development";
// usa .env.qa cuando el entorno es qa
const envFile = nodeEnv === "qa" ? ".env.qa" : ".env";

// carga variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

module.exports = {
  env: nodeEnv,
  port: Number(process.env.PORT || 3000),
  db: {
    dialect: process.env.DB_DIALECT || "sqlite",
    storage:
      process.env.DB_STORAGE ||
      (nodeEnv === "qa" ? "./database/qa.sqlite" : "./database/dev.sqlite"),
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    username: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    logging: process.env.DB_LOGGING === "true"
  },
  mail: {
    mode: (process.env.MAIL_MODE || "auto").toLowerCase(),
    host: process.env.MAIL_HOST || "",
    port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587,
    secure: process.env.MAIL_SECURE === "true",
    user: process.env.MAIL_USER || "",
    pass: process.env.MAIL_PASS || "",
    from: process.env.MAIL_FROM || "no-reply@bookapp.local",
    testTo: process.env.MAIL_TEST_TO || ""
  }
};
