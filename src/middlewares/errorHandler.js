// src/middlewares/errorHandler.js

const logger = require('../config/logger'); 
// 1. Importación correcta de la librería http-status-codes
const { StatusCodes, getReasonPhrase } = require('http-status-codes');

const errorHandler = (err, req, res, next) => {
    
    // 1. Evitar el error "Can't set headers"
    if (res.headersSent) {
        return next(err);
    }
    
    // --- 1. Definir los valores de estado y mensaje ---
    // Usamos las constantes importadas (500)
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR; 
    let message = 'Error interno del servidor.';

    // Asegurarnos de que 'err' es un objeto válido.
    if (!err || typeof err !== 'object') {
        err = new Error(message);
    }
    
    // --- 2. Lógica para determinar el estado ---

    // Prioridad 1: Errores de Sequelize conocidos
    if (err.name === 'SequelizeUniqueConstraintError' || err.code === '23505' || err.name === 'SequelizeValidationError') {
        // Usamos StatusCodes.BAD_REQUEST (400)
        statusCode = StatusCodes.BAD_REQUEST; 
        
        // Formatear el mensaje del error de validación o restricción
        if (err.name === 'SequelizeUniqueConstraintError') {
             message = 'El recurso ya existe o el email ya está registrado.';
        } else if (Array.isArray(err.errors)) {
            message = err.errors.map(e => e.message).join(', ');
        } else {
            message = err.message || 'Error de validación de datos.';
        }
        
        logger.warn(`Error ${StatusCodes.BAD_REQUEST} (Validation/Unique) en ${req.path}: ${message}`);
        
    // Prioridad 2: Errores lanzados con propiedades de estado
    } else { 
        
        // Intentamos obtener el estado de cualquiera de las propiedades comunes
        const customStatus = err.customStatus ?? err.statusCode ?? err.status;

        // Si customStatus es un número entero válido (100-599), lo usamos.
        if (Number.isInteger(customStatus) && customStatus >= 100 && customStatus < 600) {
            statusCode = customStatus;
            message = err.message || message;
        } else {
            // Si el estado no es válido, confirmamos que sea 500 y ajustamos el mensaje
            statusCode = StatusCodes.INTERNAL_SERVER_ERROR; 
            message = err.message || getReasonPhrase(statusCode);
        }
        
        // Registro del error
        if (statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
            logger.error(`Error 500 no controlado en ${req.path}: ${err.message}`, { stack: err.stack });
        } else {
             logger.warn(`Error ${statusCode} en ${req.path}: ${err.message}`);
        }
    }


    // --- 3. Respuesta al Cliente ---
    
    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
};

module.exports = errorHandler;