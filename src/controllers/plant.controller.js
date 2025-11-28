const { StatusCodes } = require('http-status-codes');
const plantService = require("../services/plant.service");
const logger = require('../config/logger'); 
const fs = require('fs');
const createError = require('http-errors'); 

const getPlants = async (req, res, next) => {
    const plants = await plantService.getPlants(req.query); 
    logger.info('Plantas obtenidas con filtros.');
    res.status(StatusCodes.OK).json(plants); 
};

const getPlant = async (req, res, next) => {
    const { id } = req.params;
    const plant = await plantService.getPlantById(id);
    logger.info(`Detalle de Planta ID ${id} obtenido.`);
    res.status(StatusCodes.OK).json(plant); 
};

const getUserPlants = async (req, res, next) => {
    const userId = req.user.id; 
    const plants = await plantService.getUserPlants(userId);
    logger.info(`Plantas del usuario ID ${userId} obtenidas.`);
    res.status(StatusCodes.OK).json(plants); 
};

const addPlant = async (req, res, next) => {
    const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : null; 
    let filePathToDelete = req.file ? req.file.path : null;

    try {
        const userId = req.user.id; 
        
        if (!imageUrl) {
            logger.warn(`Intento de crear planta sin imagen por usuario ID ${userId}.`);
            throw createError(StatusCodes.BAD_REQUEST, "La imagen de la planta es obligatoria.");
        }

        const plantData = req.parsedPlantData; 
        
        const { PlantCare: careData, tagIds, ...corePlantData } = plantData;
        
        corePlantData.userId = userId; 

        const newPlant = await plantService.createPlant(
            corePlantData, 
            tagIds, 
            careData,
            imageUrl
        );
        
        logger.info(`Planta creada (ID: ${newPlant.id}, Nombre: ${newPlant.name}) por usuario ID ${userId}.`);
        res.status(StatusCodes.CREATED).json(newPlant); 

    } catch (error) {
        if (filePathToDelete && fs.existsSync(filePathToDelete)) {
            try {
                fs.unlinkSync(filePathToDelete);
                logger.warn(`Archivo ${filePathToDelete} eliminado tras fallo en creación de planta.`);
            } catch (unlinkError) {
                logger.error(`Error al borrar archivo subido: ${unlinkError.message}`);
            }
        }
        
        logger.error(`Fallo en addPlant (User ID: ${req.user.id}): ${error.message}`);
        next(error); 
    }
};

const updatePlant = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id; 
    const { plantData, tagIds, careData } = req.body;
    
    const updatedPlant = await plantService.updatePlant(id, userId, plantData, tagIds, careData);
    logger.info(`Planta ID ${id} actualizada por usuario ID ${userId}.`);
    res.status(StatusCodes.OK).json(updatedPlant); 
};

const deletePlant = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id; 
    
    await plantService.deletePlant(id, userId);
    logger.info(`Planta ID ${id} eliminada por usuario ID ${userId}.`);
    res.status(StatusCodes.NO_CONTENT).send(); 
};

module.exports = { 
    getPlants, 
    getPlant, 
    getUserPlants,
    addPlant, 
    updatePlant, 
    deletePlant 
};