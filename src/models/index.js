// src/models/index.js

const sequelize = require("../config/db");

// --- 1. Importar Modelos DEFINIDOS ---
// Importamos directamente las instancias de los modelos que ya han sido definidas
// usando sequelize.define() en sus respectivos archivos.
const User = require("./user.model"); 
const Plant = require("./plant.model");
const Tag = require("./tag.model");
const PlantCare = require("./plantCare.model");
const AdoptionRequest = require("./adoptionRequest.model");
const Message = require("./message.model");
const PlantTag = require('./planttag.model'); 


// --- 2. Objeto de Modelos (DB) ---
// Simplemente recopilamos los modelos ya inicializados.
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

// --- 3. Aplicar Asociaciones ---
// Importamos la función de lógica de asociaciones.
const applyAssociations = require("./associations"); 

// Llamamos la función importada y le pasamos el objeto 'db' con todos los modelos.
applyAssociations(db); 

// --- 4. Inicialización de la DB ---
const initDB = async () => {
  try {
await sequelize.authenticate();
    console.log("✅ Conectado a MariaDB con Sequelize");

    // ====================================================================
    // ⚠️ PASO TEMPORAL Y GLOBAL PARA RESOLVER DEPENDENCIAS Y EL LÍMITE DE KEYS
    // Esto ELIMINARÁ *TODAS* las tablas y datos. 
    // Una vez que el proyecto inicie, DEBES cambiar esto a { alter: true }.
    await sequelize.sync({ alter: true });
    // ====================================================================
    
    console.log("✅ Tablas sincronizadas");
  } catch (error) {
    console.error("❌ Error conectando a la DB:", error);
    throw error;
  }
};

module.exports = { 
  ...db, 
  initDB
};