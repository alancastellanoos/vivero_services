// src/controllers/user.controller.js (Limpio y Funcional)

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger'); 
// No se necesita importar catchAsync ni usarlo si delegamos los errores
// a la forma estándar de Express para funciones async.

const { 
  getUsers: getUsersService, 
  getUserById: getUserByIdService,
  createUser: createUserService,
  updateUser: updateUserService,
  deleteUser: deleteUserService,
} = require("../services/user.service");

// --- Controladores Asíncronos (Delegando Errores) ---

const getUsers = async (req, res, next) => {
    // Si getUsersService falla, el error va directamente a errorHandler.js
    const users = await getUsersService();
    logger.info('Usuarios obtenidos.');
    res.status(StatusCodes.OK).json(users); 
};


const getUser = async (req, res, next) => {
    const { id } = req.params;
    // Si getUserByIdService falla, el error va directamente a errorHandler.js
    const user = await getUserByIdService(id);
    logger.info(`Usuario ID ${id} obtenido.`);
    res.status(StatusCodes.OK).json(user); 
};

const addUser = async (req, res, next) => {
    // Si createUserService falla (ej. SequelizeValidationError), el error va a errorHandler.js
    const newUser = await createUserService(req.body);
    logger.info(`Usuario creado: ${newUser.email}`);
    // Respuesta exitosa (201 CREATED)
    res.status(StatusCodes.CREATED).json(newUser); 
};


const updateUser = async (req, res, next) => {
    const { id } = req.params;
    // Si updateUserService falla, el error va directamente a errorHandler.js
    const updatedUser = await updateUserService(id, req.body);
    logger.info(`Usuario ID ${id} actualizado.`);
    res.status(StatusCodes.OK).json(updatedUser); 
};


const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    // Si deleteUserService falla, el error va directamente a errorHandler.js
    await deleteUserService(id);
    logger.info(`Usuario ID ${id} eliminado.`);
    // Respuesta exitosa (204 NO_CONTENT)
    res.status(StatusCodes.NO_CONTENT).send(); 
};

module.exports = { 
  getUsers, 
  getUser, 
  addUser, 
  updateUser, 
  deleteUser 
};