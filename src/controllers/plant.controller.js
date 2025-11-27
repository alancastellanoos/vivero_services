// src/controllers/plant.controller.js (Limpio y con http-status-codes)

const { StatusCodes } = require('http-status-codes'); // Usamos la librería correcta
const plantService = require("../services/plant.service");
// const logger = require('../config/logger'); 

// --- Consulta de Plantas (Sin try...catch) ---

const getPlants = async (req, res, next) => {
    // Los errores de plantService.getPlants se pasarán a next()
    const plants = await plantService.getPlants(req.query); 
    // logger.info('Plantas obtenidas con filtros.');
    res.status(StatusCodes.OK).json(plants); // 200 OK
};

const getPlant = async (req, res, next) => {
    const { id } = req.params;
    const plant = await plantService.getPlantById(id);
    // logger.info(`Detalle de Planta ID ${id} obtenido.`);
    res.status(StatusCodes.OK).json(plant); // 200 OK
};

const getUserPlants = async (req, res, next) => {
    const userId = req.user.id; 
    const plants = await plantService.getUserPlants(userId);
    // logger.info(`Plantas del usuario ID ${userId} obtenidas.`);
    res.status(StatusCodes.OK).json(plants); // 200 OK
};

// --- Modificación de Plantas (Sin try...catch) ---

const addPlant = async (req, res, next) => {
    const userId = req.user.id; 
    const { plantData, tagIds, careData } = req.body; 

    const newPlant = await plantService.createPlant({ ...plantData, userId }, tagIds, careData);
    // logger.info(`Planta creada: ${newPlant.name}`);
    res.status(StatusCodes.CREATED).json(newPlant); // 201 CREATED
};

const updatePlant = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id; 
    const { plantData, tagIds, careData } = req.body;
    
    const updatedPlant = await plantService.updatePlant(id, userId, plantData, tagIds, careData);
    // logger.info(`Planta ID ${id} actualizada.`);
    res.status(StatusCodes.OK).json(updatedPlant); // 200 OK
};

const deletePlant = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id; 
    
    await plantService.deletePlant(id, userId);
    // logger.info(`Planta ID ${id} eliminada.`);
    res.status(StatusCodes.NO_CONTENT).send(); // 204 No Content
};

module.exports = { 
    getPlants, 
    getPlant, 
    getUserPlants,
    addPlant, 
    updatePlant, 
    deletePlant 
};