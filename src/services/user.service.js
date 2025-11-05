
const User = require("../models/user.model"); 
const httpStatus = require('http-status'); 

// Read One
const getUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) {
    // Lanzamos un error con un status code claro
    const error = new Error('Usuario no encontrado.');
    error.customStatus = httpStatus.NOT_FOUND; // 404 NOT FOUND
    throw error;
  }
  return user;
};

// Create (Registro)
const createUser = async (userData) => {
  const newUser = await User.create(userData);
  const userResponse = newUser.toJSON();
  delete userResponse.password; 
  return userResponse;
};

// Update
const updateUser = async (id, userData) => {
  const user = await User.findByPk(id);
  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.customStatus = httpStatus.NOT_FOUND; // 404 NOT FOUND
    throw error;
  }
  
  await user.update(userData);
  
  const userResponse = user.toJSON();
  delete userResponse.password;
  return userResponse;
};

// Delete
const deleteUser = async (id) => {
  const deletedRows = await User.destroy({ where: { id } });
  
  if (deletedRows === 0) {
    const error = new Error('Usuario no encontrado.');
    error.customStatus = httpStatus.NOT_FOUND; // 404 NOT FOUND
    throw error;
  }
};

// Read All (No necesita cambios, solo retorna)
const getUsers = async () => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  return users;
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};