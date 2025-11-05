// archivo: models/photo.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 
const Plant = require('./plant.model');

const Photo = sequelize.define("Photo", {
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPrimary: { // Para UX, saber cuál es la foto principal
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  plantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Plants', 
      key: 'id',
    }
  }
});

// Definir la asociación
Photo.belongsTo(Plant, { foreignKey: 'plantId' });
Plant.hasMany(Photo, { foreignKey: 'plantId' });

module.exports = Photo;