
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 
const User = require('./user.model'); 

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

  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'id',
    }
  },

  adopterId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    }
  }
});


Plant.belongsTo(User, { as: 'Owner', foreignKey: 'ownerId' });
Plant.belongsTo(User, { as: 'Adopter', foreignKey: 'adopterId' });

module.exports = Plant;