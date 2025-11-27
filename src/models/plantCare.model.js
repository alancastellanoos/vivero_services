const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlantCare = sequelize.define('PlantCare', {
  light: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  watering: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  humidity: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  temperature: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // La columna 'plantId' será añadida automáticamente por la asociación
});

module.exports = PlantCare;