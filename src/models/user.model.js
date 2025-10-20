// archivo: models/user.model.js (MODIFICADO)

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 
const bcrypt = require('bcryptjs'); // NUEVO

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// HOOK: Hashear la contraseña antes de guardar
User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

// Método para verificar la contraseña en el login
User.prototype.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;