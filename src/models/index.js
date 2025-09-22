const sequelize = require("../config/db");
const User = require("./user.model");

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(" Conectado a MariaDB con Sequelize");

    await sequelize.sync({ alter: true }); 
    console.log(" Tablas sincronizadas");
  } catch (error) {
    console.error(" Error conectando a la DB:", error);
  }
};

module.exports = { sequelize, User, initDB };
