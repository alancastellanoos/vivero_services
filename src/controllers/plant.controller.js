
const httpStatus = require('http-status');
const logger = require('../config/logger'); 
const plantService = require("../services/plant.service");
const commentService = require("../services/comment.service"); 

const createPlant = async (req, res, next) => {

  const ownerId = req.user.id; 
  const { title, description, photos, tags, ...rest } = req.body;
  
  const plant = await plantService.createPlant({ title, description, ...rest }, ownerId, photos, tags);
  logger.info(`Planta ID ${plant.id} creada por usuario ${ownerId}.`);
  res.status(httpStatus.CREATED).json(plant);
};

const getPlants = async (req, res, next) => {

  const { tag, status } = req.query; 
  const plants = await plantService.getPlants({ tag, status });
  res.status(httpStatus.OK).json(plants);
};


const getPlant = async (req, res, next) => {
  const plant = await plantService.getPlantById(req.params.id);
  res.status(httpStatus.OK).json(plant);
};

const updatePlant = async (req, res, next) => {
  const ownerId = req.user.id;
  const { tags, photos, ...plantData } = req.body; 
  logger.info(`Planta ID ${req.params.id} actualizada por dueño ${ownerId}.`);
  res.status(httpStatus.OK).json(updatedPlant);
};


const deletePlant = async (req, res, next) => {
  const ownerId = req.user.id;
  await plantService.deletePlant(req.params.id, ownerId);
  logger.info(`Planta ID ${req.params.id} eliminada por dueño ${ownerId}.`);
  res.status(httpStatus.NO_CONTENT).send();
};


const adoptPlant = async (req, res, next) => {
  const adopterId = req.user.id;
  const plant = await plantService.adoptPlant(req.params.id, adopterId);
  logger.info(`Planta ID ${req.params.id} adoptada por usuario ${adopterId}.`);
  res.status(httpStatus.OK).json({ msg: "Adopción exitosa. ¡Felicidades!", plant });
};


const addComment = async (req, res, next) => {
    const userId = req.user.id;
    const { content } = req.body;
    const { id: plantId } = req.params;

    const comment = await commentService.createComment({ plantId, userId, content });
    logger.info(`Comentario añadido a Planta ID ${plantId} por usuario ${userId}.`);
    res.status(httpStatus.CREATED).json(comment);
};

module.exports = {
  createPlant,
  getPlants,
  getPlant,
  updatePlant,
  deletePlant,
  adoptPlant,
  addComment
};