// archivo: models/comment.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 
const Plant = require('./plant.model');
const User = require('./user.model');

const Comment = sequelize.define("Comment", {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  plantId: { // A qué planta pertenece el comentario
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Plants', key: 'id' }
  },
  userId: { // Qué usuario hizo el comentario
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  }
});

// Definir asociaciones
Comment.belongsTo(Plant, { foreignKey: 'plantId' });
Plant.hasMany(Comment, { foreignKey: 'plantId' });

Comment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

module.exports = Comment;