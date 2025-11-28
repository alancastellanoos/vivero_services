const User = require("../models/user.model"); 
const createError = require('http-errors'); 
const { StatusCodes } = require('http-status-codes'); 

const getUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) {
    throw createError(StatusCodes.NOT_FOUND, 'Usuario no encontrado.');
  }
  return user;
};


const createUser = async (userData) => {
  const newUser = await User.create(userData);
  const userResponse = newUser.toJSON();
  delete userResponse.password; 
  return userResponse;
};


const updateUser = async (id, userData) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw createError(StatusCodes.NOT_FOUND, 'Usuario no encontrado.');
  }
  
  await user.update(userData);
  
  const userResponse = user.toJSON();
  delete userResponse.password;
  return userResponse;
};


const deleteUser = async (id) => {
  const deletedRows = await User.destroy({ where: { id } });
  
  if (deletedRows === 0) {
    throw createError(StatusCodes.NOT_FOUND, 'Usuario no encontrado.');
  }
};


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