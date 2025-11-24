
const logger = require('../config/logger');
const httpStatus = require('http-status'); 

const errorHandler = (err, req, res, next) => {

    let statusCode = httpStatus.INTERNAL_SERVER_ERROR; 
    let message = 'Error interno del servidor.';


    

    if (err.name === 'SequelizeUniqueConstraintError' || err.code === '23505') {
        statusCode = httpStatus.BAD_REQUEST; 
        message = 'El recurso ya existe o el email ya está registrado.';
        logger.warn(`Error 400 (Unique Constraint) en ${req.path}: ${err.message}`);


    } else if (err.name === 'SequelizeValidationError') {
        statusCode = httpStatus.BAD_REQUEST; 
        message = err.errors.map(e => e.message).join(', ');
        logger.warn(`Error 400 (Validation) en ${req.path}: ${message}`);
        

    } else if (err.customStatus) {
        statusCode = err.customStatus;
        message = err.message;


    } else {
        logger.error(`Error 500 en ${req.path}: ${err.message}`, { stack: err.stack });
    }


    if (logger && typeof logger.error === 'function') {
        logger.error(message, { stack: err.stack, path: req.originalUrl, method: req.method });
    } else {
        console.error(err);
    }


    res.status(statusCode).json({
        error: message,
    });
};

module.exports = errorHandler;