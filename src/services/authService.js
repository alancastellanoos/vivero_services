 
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); 
const logger = require('../config/logger');

const generateToken = (userId) => {
    const payload = { uid: userId };
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '2h',
    });
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        logger.warn(`Intento de login fallido: Email no encontrado: ${email}`);
        throw new Error('Credenciales inválidas.');
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        logger.warn(`Intento de login fallido: Contraseña incorrecta para ${email}`);
        throw new Error('Credenciales inválidas.');
    }

    const token = generateToken(user.id);
    
    logger.info(`Login exitoso para el usuario ID: ${user.id}`);
    
    return { user, token };
};

module.exports = { loginUser, generateToken };