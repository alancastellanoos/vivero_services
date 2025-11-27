const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Plant = sequelize.define('Plant', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'PENDING_AGREEMENT', 'ADOPTED'),
    allowNull: false,
    defaultValue: 'AVAILABLE'
  },
  isCatalog: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // La columna 'userId' (Donante) será añadida automáticamente por la asociación
});

module.exports = Plant;