const { Message, AdoptionRequest, Plant } = require('../models/index');
const createError = require('http-errors');
const { StatusCodes } = require('http-status-codes');

const isUserInChat = async (requestId, userId) => {
    const request = await AdoptionRequest.findByPk(requestId, {
        include: [{ model: Plant, as: 'Plant' }]
    });

    if (!request || request.status !== 'ACCEPTED') {
        throw createError(StatusCodes.FORBIDDEN, 'Chat no habilitado. Solicitud no aceptada.');
    }

    const isDonator = request.Plant.userId === userId;
    const isRequester = request.requesterId === userId;
    
    if (!isDonator && !isRequester) {
        throw createError(StatusCodes.FORBIDDEN, 'No tienes acceso a este chat.');
    }
    
    return { request, isDonator, isRequester };
};

const getMessages = async (requestId, userId) => {
    await isUserInChat(requestId, userId); 

    const messages = await Message.findAll({
        where: { requestId },
        include: [{ model: Message.sequelize.models.User, as: 'Sender', attributes: ['id', 'name'] }],
        order: [['createdAt', 'ASC']]
    });

    return messages;
};

const createMessage = async (requestId, senderId, content) => {
    await isUserInChat(requestId, senderId);
    
    const newMessage = await Message.create({ requestId, senderId, content });
    
    const messageWithSender = await Message.findByPk(newMessage.id, {
        include: [{ model: Message.sequelize.models.User, as: 'Sender', attributes: ['id', 'name'] }]
    });

    return messageWithSender;
};

const finalizeAgreement = async (requestId, userId) => {
    const { request, isDonator, isRequester } = await isUserInChat(requestId, userId);
    
    if (!isDonator && !isRequester) {
        throw createError(StatusCodes.FORBIDDEN, 'Acceso denegado.');
    }

    await Message.update(
        { isAgreementFinalized: true },
        { where: { requestId } }
    );

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