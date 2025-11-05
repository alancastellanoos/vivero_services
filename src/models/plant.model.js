// archivo: models/plant.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 
const User = require('./user.model'); // Asume que exportas User.model.js

const Plant = sequelize.define("Plant", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "El título es obligatorio." }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('available', 'pending', 'adopted'),
    defaultValue: 'available',
    allowNull: false,
  },
  // Clave foránea del usuario que la publica (debe existir)
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Nombre de la tabla de usuarios
      key: 'id',
    }
  },
  // Clave foránea del usuario que la adopta (puede ser nulo inicialmente)
  adopterId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    }
  }
});

// Definir las asociaciones
Plant.belongsTo(User, { as: 'Owner', foreignKey: 'ownerId' });
Plant.belongsTo(User, { as: 'Adopter', foreignKey: 'adopterId' });

module.exports = Plant;