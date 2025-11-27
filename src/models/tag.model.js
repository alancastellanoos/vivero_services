
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 

const Tag = sequelize.define("Tag", {
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  }
});

module.exports = Tag;