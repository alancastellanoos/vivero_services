const sequelize = require("../config/db");

const User = require("./user.model"); 
const Plant = require("./plant.model");
const Tag = require("./tag.model");
const PlantCare = require("./plantCare.model");
const AdoptionRequest = require("./adoptionRequest.model");
const Message = require("./message.model");
const PlantTag = require('./planttag.model'); 


const db = { 
  sequelize, 
  User, 
  Plant, 
  Tag, 
  PlantCare, 
  AdoptionRequest, 
  Message, 
  PlantTag 
};

const applyAssociations = require("./associations"); 

applyAssociations(db); 

const initDB = async () => {
  try {
await sequelize.authenticate();
    console.log("Conectado a MariaDB con Sequelize");

    await sequelize.sync({ alter: true });
    
    console.log("Tablas sincronizadas");
  } catch (error) {
    console.error("Error conectando a la DB:", error);
    throw error;
  }
};

module.exports = { 
  ...db, 
  initDB
};