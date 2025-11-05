// archivo: middlewares/errorHandler.js

const logger = require('../config/logger');
const httpStatus = require('http-status'); // NUEVO: Importamos http-status

// Este middleware captura errores de forma centralizada.
const errorHandler = (err, req, res, next) => {
    // Definimos un status por defecto y un mensaje genérico.
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR; // 500
    let message = 'Error interno del servidor.';

    // --- Manejo de Errores de Negocio/Sequelize ---
    
    // 1. Error de unicidad (ej. email ya existe)
    if (err.name === 'SequelizeUniqueConstraintError' || err.code === '23505') {
        statusCode = httpStatus.BAD_REQUEST; // 400
        message = 'El recurso ya existe o el email ya está registrado.';
        logger.warn(`Error 400 (Unique Constraint) en ${req.path}: ${err.message}`);

    // 2. Error de validación de Sequelize
    } else if (err.name === 'SequelizeValidationError') {
        statusCode = httpStatus.BAD_REQUEST; // 400
        message = err.errors.map(e => e.message).join(', ');
        logger.warn(`Error 400 (Validation) en ${req.path}: ${message}`);
        
    // 3. Errores lanzados desde el servicio con un status code personalizado
    } else if (err.customStatus) {
        statusCode = err.customStatus;
        message = err.message;

    // 4. Error genérico del sistema (500)
    } else {
        logger.error(`Error 500 en ${req.path}: ${err.message}`, { stack: err.stack });
    }

    // Loggear el error completo para depuración
    if (logger && typeof logger.error === 'function') {
        logger.error(message, { stack: err.stack, path: req.originalUrl, method: req.method });
    } else {
        console.error(err);
    }

    // Enviar respuesta
    res.status(statusCode).json({
        error: message,
    });
};

module.exports = errorHandler;