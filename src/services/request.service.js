const { AdoptionRequest, Plant, User } = require('../models/index');
const createError = require('http-errors');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const REQUEST_INCLUDE_OPTIONS = [
    { 
        model: Plant, 
        as: 'Plant', 
        attributes: ['id', 'name', 'image_url', 'userId'], 
        include: [{ model: User, as: 'Donator', attributes: ['id', 'name'] }]
    },
    { model: User, as: 'Requester', attributes: ['id', 'name'] }
];

const createAdoptionRequest = async (plantId, requesterId, message) => {
    const plant = await Plant.findByPk(plantId);

    if (!plant || plant.status !== 'AVAILABLE') {
        throw createError(StatusCodes.BAD_REQUEST, 'La planta no está disponible para adopción.');
    }
    
    if (plant.userId === requesterId) {
        throw createError(StatusCodes.FORBIDDEN, 'No puedes enviar una solicitud para tu propia planta.');
    }

    const existingRequest = await AdoptionRequest.findOne({
        where: { plantId, requesterId }
    });

    if (existingRequest) {
        throw createError(StatusCodes.CONFLICT, 'Ya has enviado una solicitud para esta planta.');
    }
    
    const request = await AdoptionRequest.create({ 
        plantId, 
        requesterId, 
        message, 
        status: 'PENDING' 
    });

    return request;
};

const getIncomingRequests = async (donatorId) => {
    const plants = await Plant.findAll({
        where: { userId: donatorId },
        attributes: ['id']
    });
    const plantIds = plants.map(p => p.id);
    
    if (plantIds.length === 0) {
        return []; 
    }

    const requests = await AdoptionRequest.findAll({
        where: { plantId: plantIds }, 
        include: REQUEST_INCLUDE_OPTIONS,
        order: [['createdAt', 'DESC']]
    });

    return requests;
};

const getOutgoingRequests = async (requesterId) => {
    const requests = await AdoptionRequest.findAll({
        where: { requesterId },
        include: REQUEST_INCLUDE_OPTIONS,
        order: [['createdAt', 'DESC']]
    });
    return requests;
};

const acceptRequest = async (requestId, donatorId) => {
    const request = await AdoptionRequest.findByPk(requestId, {
        include: [{ model: Plant, as: 'Plant' }]
    });

    if (!request) {
        throw createError(StatusCodes.NOT_FOUND, 'Solicitud no encontrada.');
    }

    if (request.Plant.userId !== donatorId) {
        throw createError(StatusCodes.FORBIDDEN, 'No tienes permiso para aceptar esta solicitud.');
    }
    
    if (request.status !== 'PENDING') {
         throw createError(StatusCodes.BAD_REQUEST, 'La solicitud ya ha sido procesada.');
    }

    await AdoptionRequest.sequelize.transaction(async (t) => {
        await request.update({ status: 'ACCEPTED' }, { transaction: t });

        await request.Plant.update({ status: 'PENDING_AGREEMENT' }, { transaction: t });

        await AdoptionRequest.update(
            { status: 'REJECTED' },
            { 
                where: { 
                    plantId: request.plantId, 
                    id: { [Op.ne]: requestId }, 
                    status: 'PENDING' 
                },
                transaction: t
            }
        );
    });
    
    const acceptedRequest = await AdoptionRequest.findByPk(requestId, { include: REQUEST_INCLUDE_OPTIONS });

    return acceptedRequest;
};

const rejectRequest = async (requestId, donatorId) => {
    const request = await AdoptionRequest.findByPk(requestId, {
        include: [{ model: Plant, as: 'Plant' }]
    });

    if (!request) {
        throw createError(StatusCodes.NOT_FOUND, 'Solicitud no encontrada.');
    }
    
    if (request.Plant.userId !== donatorId) {
        throw createError(StatusCodes.FORBIDDEN, 'No tienes permiso para rechazar esta solicitud.');
    }

    if (request.status !== 'PENDING') {
        throw createError(StatusCodes.BAD_REQUEST, 'La solicitud ya ha sido procesada.');
    }

    await request.update({ status: 'REJECTED' });
    
    const rejectedRequest = await AdoptionRequest.findByPk(requestId, { include: REQUEST_INCLUDE_OPTIONS });
    
    return rejectedRequest;
};

module.exports = {
    createAdoptionRequest,
    getIncomingRequests,
    getOutgoingRequests,
    acceptRequest,
    rejectRequest
};