const { Message, AdoptionRequest, Plant } = require('../models/index');
const createError = require('http-errors');
const { StatusCodes } = require('http-status-codes');

const User = Message.sequelize.models.User; 

const isUserInChat = async (requestId, userId) => {
    const request = await AdoptionRequest.findByPk(requestId, {
        include: [
            { 
                model: Plant, 
                as: 'Plant',
                include: [{ model: User, as: 'Donator', attributes: ['id', 'name'] }]
            },
            { model: User, as: 'Requester', attributes: ['id', 'name'] }
        ]
    });

    if (!request || request.status !== 'ACCEPTED') {
        throw createError(StatusCodes.FORBIDDEN, 'Chat no habilitado. Solicitud no aceptada o pendiente.');
    }

    const isDonator = request.Plant.Donator.id === userId; 
    const isRequester = request.requesterId === userId;
    
    if (!isDonator && !isRequester) {
        throw createError(StatusCodes.FORBIDDEN, 'No tienes acceso a este chat.');
    }
    
    return { request, isDonator, isRequester };
};

const getMessages = async (requestId, userId) => {
    const { request } = await isUserInChat(requestId, userId); 

    const messages = await Message.findAll({
        where: { requestId },
        order: [['createdAt', 'ASC']]
    });

    const isAgreementFinalized = messages.some(msg => msg.isAgreementFinalized);
    
    return {
        messages: messages, 
        request: request, 
        isAgreementFinalized: isAgreementFinalized,
        currentUserId: userId 
    };
};

const createMessage = async (requestId, senderId, content) => {
    await isUserInChat(requestId, senderId);
    
    const newMessage = await Message.create({ requestId, senderId, content });
    
    const messageWithSender = await Message.findByPk(newMessage.id, {
        include: [{ 
            model: User, 
            as: 'Sender', 
            attributes: ['id', 'name'] 
        }]
    });

    return messageWithSender;
};

const finalizeAgreement = async (requestId, userId) => {
    const { request } = await isUserInChat(requestId, userId);
    

    await Message.create({
        requestId: requestId,
        senderId: userId,
        content: `Acuerdo finalizado por el usuario.`,
        isAgreementFinalized: true
    });


    await Plant.update(
        { status: 'ADOPTED' },
        { where: { id: request.plantId } }
    );
    
    return { success: true, plantId: request.plantId, message: "Acuerdo de adopción finalizado exitosamente." };
};

module.exports = {
    getMessages,
    createMessage,
    finalizeAgreement
};