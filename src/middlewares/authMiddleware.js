

const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); 
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {

    const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            msg: 'No hay token en la petición. Acceso denegado.'
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(uid);

        if (!user) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existe en DB.'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        logger.warn(`Token inválido o expirado: ${token}`);
        res.status(401).json({
            msg: 'Token no válido o expirado.'
        });
    }
};

module.exports = { authMiddleware };