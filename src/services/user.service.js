// archivo: services/user.service.js (CORREGIDO a CommonJS)

const User = require("../models/user.model"); // Usar require para CommonJS

// Solo lógica de negocio.
const getUsers = async () => {
  const users = await User.findAll();
  return users;
};

const createUser = async (userData) => {
  const user = await User.create(userData);
  return user;
};

// Exportar las funciones usando module.exports
module.exports = {
  getUsers,
  createUser
};