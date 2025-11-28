const logger = require('../config/logger'); 
const { StatusCodes, getReasonPhrase } = require('http-status-codes');

const errorHandler = (err, req, res, next) => {
    
    if (res.headersSent) {
        return next(err);
    }
    
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR; 
    let message = 'Error interno del servidor.';

    if (!err || typeof err !== 'object') {
        err = new Error(message);
    }
    
    if (err.name === 'SequelizeUniqueConstraintError' || err.code === '23505' || err.name === 'SequelizeValidationError') {
        statusCode = StatusCodes.BAD_REQUEST; 
        
        if (err.name === 'SequelizeUniqueConstraintError') {
             message = 'El recurso ya existe o el email ya está registrado.';
        } else if (Array.isArray(err.errors)) {
            message = err.errors.map(e => e.message).join(', ');
        } else {
            message = err.message || 'Error de validación de datos.';
        }
        
        logger.warn(`Error ${StatusCodes.BAD_REQUEST} (Validation/Unique) en ${req.path}: ${message}`);
        
    } else { 
        
        const customStatus = err.customStatus ?? err.statusCode ?? err.status;

        if (Number.isInteger(customStatus) && customStatus >= 100 && customStatus < 600) {
            statusCode = customStatus;
            message = err.message || message;
        } else {
            statusCode = StatusCodes.INTERNAL_SERVER_ERROR; 
            message = err.message || getReasonPhrase(statusCode);
        }
        
        if (statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
            logger.error(`Error 500 no controlado en ${req.path}: ${err.message}`, { stack: err.stack });
        } else {
             logger.warn(`Error ${statusCode} en ${req.path}: ${err.message}`);
        }
    }
    
    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
};

module.exports = errorHandler;