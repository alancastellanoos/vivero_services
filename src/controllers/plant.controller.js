// archivo: controllers/plant.controller.js

const httpStatus = require('http-status');
const logger = require('../config/logger'); 
const plantService = require("../services/plant.service");
const commentService = require("../services/comment.service"); // Necesario para comentarios

// [CREATE] Crear Planta
const createPlant = async (req, res, next) => {
  // ownerId viene del token JWT (req.user)
  const ownerId = req.user.id; 
  const { title, description, photos, tags, ...rest } = req.body;
  
  const plant = await plantService.createPlant({ title, description, ...rest }, ownerId, photos, tags);
  logger.info(`Planta ID ${plant.id} creada por usuario ${ownerId}.`);
  res.status(httpStatus.CREATED).json(plant);
};

// [READ ALL] Obtener Plantas con Filtros
const getPlants = async (req, res, next) => {
  // Filtros de búsqueda (UX: buscar por tag o status)
  const { tag, status } = req.query; 
  const plants = await plantService.getPlants({ tag, status });
  res.status(httpStatus.OK).json(plants);
};

// [READ ONE] Obtener una Planta
const getPlant = async (req, res, next) => {
  const plant = await plantService.getPlantById(req.params.id);
  res.status(httpStatus.OK).json(plant);
};

// [UPDATE] Actualizar Planta (Requiere ser dueño)
const updatePlant = async (req, res, next) => {
  const ownerId = req.user.id;
  const { tags, photos, ...plantData } = req.body; // Ignorar photos/tags si vienen sin lógica de manejo de archivos
  
  const updatedPlant = await plantService.updatePlant(req.params.id, ownerId, plantData, tags);
  logger.info(`Planta ID ${req.params.id} actualizada por dueño ${ownerId}.`);
  res.status(httpStatus.OK).json(updatedPlant);
};

// [DELETE] Eliminar Planta (Requiere ser dueño)
const deletePlant = async (req, res, next) => {
  const ownerId = req.user.id;
  await plantService.deletePlant(req.params.id, ownerId);
  logger.info(`Planta ID ${req.params.id} eliminada por dueño ${ownerId}.`);
  res.status(httpStatus.NO_CONTENT).send();
};

// [ADOPT] Adoptar una Planta (Nueva funcionalidad UX)
const adoptPlant = async (req, res, next) => {
  const adopterId = req.user.id;
  const plant = await plantService.adoptPlant(req.params.id, adopterId);
  logger.info(`Planta ID ${req.params.id} adoptada por usuario ${adopterId}.`);
  res.status(httpStatus.OK).json({ msg: "Adopción exitosa. ¡Felicidades!", plant });
};

// [COMMENT] Agregar un Comentario
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