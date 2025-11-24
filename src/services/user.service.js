
const User = require("../models/user.model"); 
const httpStatus = require('http-status'); 


const getUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) {

    const error = new Error('Usuario no encontrado.');
    error.customStatus = httpStatus.NOT_FOUND; 
    throw error;
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
    const error = new Error('Usuario no encontrado.');
    error.customStatus = httpStatus.NOT_FOUND; 
    throw error;
  }
  
  await user.update(userData);
  
  const userResponse = user.toJSON();
  delete userResponse.password;
  return userResponse;
};


const deleteUser = async (id) => {
  const deletedRows = await User.destroy({ where: { id } });
  
  if (deletedRows === 0) {
    const error = new Error('Usuario no encontrado.');
    error.customStatus = httpStatus.NOT_FOUND; 
    throw error;
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