const { sequelize } = require("../models");
const env = require("../config/env");

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log(`base sincronizada en entorno ${env.env}`);
  } catch (error) {
    console.error("no fue posible sincronizar la base", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
