const { StatusCodes } = require('http-status-codes');
const requestService = require("../services/request.service");

const addRequest = async (req, res, next) => {
    try {
        const requesterId = req.user.id; 
        const { plantId, message } = req.body;
        
        const newRequest = await requestService.createAdoptionRequest(plantId, requesterId, message);
        
        res.status(StatusCodes.CREATED).json(newRequest); 
    } catch (error) {
        next(error); 
    }
};

const getIncomingRequests = async (req, res, next) => {
    try {
        const donatorId = req.user.id; 
        
        const requests = await requestService.getIncomingRequests(donatorId);
        
        res.status(StatusCodes.OK).json(requests); 
    } catch (error) {
        next(error);
    }
};

const getOutgoingRequests = async (req, res, next) => {
    try {
        const requesterId = req.user.id; 
        
        const requests = await requestService.getOutgoingRequests(requesterId);
        
        res.status(StatusCodes.OK).json(requests); 
    } catch (error) {
        next(error);
    }
};

const acceptRequest = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const donatorId = req.user.id; 
        
        const acceptedRequest = await requestService.acceptRequest(id, donatorId);
        
        res.status(StatusCodes.OK).json(acceptedRequest); 
    } catch (error) {
        next(error);
    }
};

const rejectRequest = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const donatorId = req.user.id; 
        
        const rejectedRequest = await requestService.rejectRequest(id, donatorId);
        
        res.status(StatusCodes.OK).json(rejectedRequest); 
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    addRequest, 
    getIncomingRequests, 
    getOutgoingRequests, 
    acceptRequest, 
    rejectRequest 
};