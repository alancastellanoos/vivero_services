const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlantTag = sequelize.define('PlantTag', {
    // Las claves 'plantId' y 'tagId' se definen en el archivo de relaciones
}, {
    // Esto asegura que Sequelize use los nombres de las claves primarias compuestas
    timestamps: true
});

module.exports = PlantTag;