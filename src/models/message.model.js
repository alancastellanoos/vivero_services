const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isAgreementFinalized: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // Las columnas 'requestId' y 'senderId' serán añadidas automáticamente
});

module.exports = Message;