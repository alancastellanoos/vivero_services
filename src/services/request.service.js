// src/services/request.service.js (CORREGIDO)

const { AdoptionRequest, Plant, User } = require('../models/index');
const createError = require('http-errors');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize'); // ⬅️ IMPORTACIÓN DEL OPERADOR DE SEQUELIZE

// --- Funciones de Solicitud ---

const createAdoptionRequest = async (plantId, requesterId, message) => {
    const plant = await Plant.findByPk(plantId);

    if (!plant || plant.status !== 'AVAILABLE') {
        throw createError(StatusCodes.BAD_REQUEST, 'La planta no está disponible para adopción.');
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
        attributes: ['id', 'name']
    });

    const plantIds = plants.map(p => p.id);

    const requests = await AdoptionRequest.findAll({
        where: { plantId: plantIds, status: 'PENDING' },
        include: [
            { model: Plant, as: 'Plant', attributes: ['id', 'name'] },
            { model: User, as: 'Requester', attributes: ['id', 'name'] }
        ],
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

    await request.update({ status: 'ACCEPTED' });

    await request.Plant.update({ status: 'PENDING_AGREEMENT' });

    // Corrección: Usamos [Op.ne] en lugar de [AdoptionRequest.sequelize.Op.ne]
    await AdoptionRequest.update(
        { status: 'REJECTED' },
        { 
            where: { 
                plantId: request.plantId, 
                id: { [Op.ne]: requestId }, // ⬅️ USO CORRECTO DEL OPERADOR
                status: 'PENDING' 
            } 
        }
    );

    return request;
};

const rejectRequest = async (requestId, donatorId) => {
    const request = await AdoptionRequest.findByPk(requestId, {
        include: [{ model: Plant, as: 'Plant' }]
    });

    if (!request || request.status !== 'PENDING') {
        throw createError(StatusCodes.BAD_REQUEST, 'Solicitud no encontrada o ya procesada.');
    }

    if (request.Plant.userId !== donatorId) {
        throw createError(StatusCodes.FORBIDDEN, 'No tienes permiso para rechazar esta solicitud.');
    }

    await request.update({ status: 'REJECTED' });
    return request;
};

module.exports = {
    createAdoptionRequest,
    getIncomingRequests,
    acceptRequest,
    rejectRequest
};