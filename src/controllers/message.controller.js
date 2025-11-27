// src/controllers/message.controller.js (Limpio y con http-status-codes)

const { StatusCodes } = require('http-status-codes'); // Usamos la librería correcta
const messageService = require("../services/message.service");

// --- Gestión de Mensajes (Sin try...catch) ---

const getMessages = async (req, res, next) => {
    const { requestId } = req.params; // ID de la Solicitud (que actúa como ID del chat)
    const userId = req.user.id; 
    
    // Si messageService.getMessages falla, el error es delegado a next()
    const messages = await messageService.getMessages(requestId, userId);
    
    // Respuesta exitosa (200 OK)
    res.status(StatusCodes.OK).json(messages); 
};

const addMessage = async (req, res, next) => {
    const { requestId } = req.params;
    const senderId = req.user.id;
    const { content } = req.body;
    
    // Si messageService.createMessage falla, el error es delegado a next()
    const newMessage = await messageService.createMessage(requestId, senderId, content);
    
    // Respuesta exitosa (201 CREATED)
    res.status(StatusCodes.CREATED).json(newMessage); 
};

const finalizeAgreement = async (req, res, next) => {
    const { requestId } = req.params;
    const userId = req.user.id;
    
    // Si messageService.finalizeAgreement falla, el error es delegado a next()
    const result = await messageService.finalizeAgreement(requestId, userId);
    
    // Respuesta exitosa (200 OK)
    res.status(StatusCodes.OK).json(result); 
};

module.exports = { 
    getMessages, 
    addMessage, 
    finalizeAgreement 
};