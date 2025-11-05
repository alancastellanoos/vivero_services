// archivo: controllers/user.controller.js (SIN TRY-CATCH, Con HTTP-STATUS)

const httpStatus = require('http-status'); // NUEVO
const logger = require('../config/logger'); 
const { 
  getUsers: getUsersService, 
  getUserById: getUserByIdService,
  createUser: createUserService,
  updateUser: updateUserService,
  deleteUser: deleteUserService,
} = require("../services/user.service");

// Read All
const getUsers = async (req, res, next) => {
  const users = await getUsersService();
  logger.info('Usuarios obtenidos.');
  res.status(httpStatus.OK).json(users); // 200 OK
};

// Read One
const getUser = async (req, res, next) => {
  const { id } = req.params;
  const user = await getUserByIdService(id);
  logger.info(`Usuario ID ${id} obtenido.`);
  res.status(httpStatus.OK).json(user); // 200 OK
};

// Create (Registro)
const addUser = async (req, res, next) => {
  const newUser = await createUserService(req.body);
  logger.info(`Usuario creado: ${newUser.email}`);
  res.status(httpStatus.CREATED).json(newUser); // 201 CREATED
};

// Update
const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const updatedUser = await updateUserService(id, req.body);
  logger.info(`Usuario ID ${id} actualizado.`);
  res.status(httpStatus.OK).json(updatedUser); // 200 OK
};

// Delete
const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  await deleteUserService(id);
  logger.info(`Usuario ID ${id} eliminado.`);
  // 204 NO CONTENT es el estándar para eliminación exitosa sin cuerpo de respuesta
  res.status(httpStatus.NO_CONTENT).send(); 
};

module.exports = { 
  getUsers, 
  getUser, 
  addUser, 
  updateUser, 
  deleteUser 
};