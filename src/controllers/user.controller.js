const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger'); 

const { 
  getUsers: getUsersService, 
  getUserById: getUserByIdService,
  createUser: createUserService,
  updateUser: updateUserService,
  deleteUser: deleteUserService,
} = require("../services/user.service");

const getProfile = async (req, res, next) => {
    try {
        const id = req.user.id; 
        
        const user = await getUserByIdService(id);
        
        logger.info(`Perfil de usuario ID ${id} obtenido.`);
        res.status(StatusCodes.OK).json(user);
    } catch (error) {
        next(error);
    }
};


const getUsers = async (req, res, next) => {
    const users = await getUsersService();
    logger.info('Usuarios obtenidos.');
    res.status(StatusCodes.OK).json(users); 
};


const getUser = async (req, res, next) => {
    const { id } = req.params;
    const user = await getUserByIdService(id);
    logger.info(`Usuario ID ${id} obtenido.`);
    res.status(StatusCodes.OK).json(user); 
};

const addUser = async (req, res, next) => {
    const newUser = await createUserService(req.body);
    logger.info(`Usuario creado: ${newUser.email}`);
    res.status(StatusCodes.CREATED).json(newUser); 
};


const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const updatedUser = await updateUserService(id, req.body);
    logger.info(`Usuario ID ${id} actualizado.`);
    res.status(StatusCodes.OK).json(updatedUser); 
};


const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    await deleteUserService(id);
    logger.info(`Usuario ID ${id} eliminado.`);
    res.status(StatusCodes.NO_CONTENT).send(); 
};

module.exports = { 
  getUsers, 
  getUser, 
  addUser, 
  updateUser, 
  deleteUser,
  getProfile 
};