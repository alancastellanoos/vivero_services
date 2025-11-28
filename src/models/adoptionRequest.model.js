const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdoptionRequest = sequelize.define('AdoptionRequest', {
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },

});

module.exports = AdoptionRequest;