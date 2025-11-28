const { StatusCodes } = require('http-status-codes'); 
const messageService = require("../services/message.service");

const getMessages = async (req, res, next) => {
    const { requestId } = req.params; 
    const userId = req.user.id; 
    
    const messages = await messageService.getMessages(requestId, userId);
    
    res.status(StatusCodes.OK).json(messages); 
};

const addMessage = async (req, res, next) => {
    const { requestId } = req.params;
    const senderId = req.user.id;
    const { content } = req.body;
    
    const newMessage = await messageService.createMessage(requestId, senderId, content);
    
    res.status(StatusCodes.CREATED).json(newMessage); 
};

const finalizeAgreement = async (req, res, next) => {
    const { requestId } = req.params;
    const userId = req.user.id;
    
    const result = await messageService.finalizeAgreement(requestId, userId);
    
    res.status(StatusCodes.OK).json(result); 
};

module.exports = { 
    getMessages, 
    addMessage, 
    finalizeAgreement 
};