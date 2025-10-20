// archivo: controllers/user.controller.js (Refactorizado)

const logger = require('../config/logger'); 
const { getUsers: getUsersService, createUser: createUserService } = require("../services/user.service");

const getUsers = async (req, res) => {
  try {
    const users = await getUsersService();
    logger.info('Solicitud exitosa de lista de usuarios.');
    res.json(users);
  } catch (err) {
    logger.error(`Error al obtener usuarios: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Error interno del servidor al obtener usuarios.' });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const newUser = await createUserService({ name, email, password }); 
    
    logger.info(`Usuario creado: ${newUser.email}`);
    
    // Devolvemos el usuario, excluyendo la contraseña hasheada
    res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
    });

  } catch (err) {
    // Manejo de error de duplicado de Sequelize (email unique)
    if (err.name === 'SequelizeUniqueConstraintError') { 
        logger.warn(`Intento de registro fallido: Email duplicado: ${req.body.email}`);
        return res.status(400).json({ error: 'El email ya está registrado.' });
    }
    
    logger.error(`Error al crear usuario: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Error interno del servidor al registrar.' });
  }
};

module.exports = { getUsers, addUser };