// src/controllers/request.controller.js (Limpio y con http-status-codes)

const { StatusCodes } = require('http-status-codes'); // Usamos la librería correcta
const requestService = require("../services/request.service");

// --- Gestión de Solicitudes (Sin try...catch) ---

const addRequest = async (req, res, next) => {
    const requesterId = req.user.id; // Adoptante
    const { plantId, message } = req.body;
    
    // Si createAdoptionRequest falla, el error es pasado a next()
    const newRequest = await requestService.createAdoptionRequest(plantId, requesterId, message);
    
    // Respuesta exitosa (201 CREATED)
    res.status(StatusCodes.CREATED).json(newRequest); 
};

const getIncomingRequests = async (req, res, next) => {
    const donatorId = req.user.id; // Donante (propietario de las plantas)
    
    // Si getIncomingRequests falla, el error es pasado a next()
    const requests = await requestService.getIncomingRequests(donatorId);
    
    // Respuesta exitosa (200 OK)
    res.status(StatusCodes.OK).json(requests); 
};

const acceptRequest = async (req, res, next) => {
    const { id } = req.params; // ID de la Solicitud
    const donatorId = req.user.id; // Donante
    
    // Si acceptRequest falla (ej. permiso o solicitud no encontrada), el error es pasado a next()
    const acceptedRequest = await requestService.acceptRequest(id, donatorId);
    
    // Respuesta exitosa (200 OK)
    res.status(StatusCodes.OK).json(acceptedRequest); 
};

const rejectRequest = async (req, res, next) => {
    const { id } = req.params; // ID de la Solicitud
    const donatorId = req.user.id; // Donante
    
    // Si rejectRequest falla, el error es pasado a next()
    const rejectedRequest = await requestService.rejectRequest(id, donatorId);
    
    // Respuesta exitosa (200 OK)
    res.status(StatusCodes.OK).json(rejectedRequest); 
};

module.exports = { 
    addRequest, 
    getIncomingRequests, 
    acceptRequest, 
    rejectRequest 
};