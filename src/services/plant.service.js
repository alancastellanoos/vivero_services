const { Plant, PlantCare, PlantTag, Tag, User, AdoptionRequest } = require('../models/index'); 
const createError = require('http-errors');
const { StatusCodes } = require('http-status-codes');

const PLANT_FULL_INCLUDE_OPTIONS = [
    { model: User, as: 'Donator', attributes: ['id', 'name'] },
    { model: Tag, as: 'tags' },
    { model: PlantCare }
];

const getPlants = async (filters) => {
    const { searchTerm, tagId, status, isCatalog } = filters;
    const where = {};
    const include = [
        { model: Tag, as: 'tags' },
        { model: User, as: 'Donator', attributes: ['id', 'name'] },
        { model: PlantCare, required: isCatalog === 'true' }
    ];

    if (searchTerm) {
        where.name = { [Plant.sequelize.Op.like]: `%${searchTerm}%` };
    }

    if (status) {
        where.status = status;
    } else if (isCatalog === 'false' || !isCatalog) {
        where.status = 'AVAILABLE';
    }

    if (isCatalog) {
        where.isCatalog = isCatalog === 'true';
    }
    
    if (tagId) {
        include[0].where = { id: tagId }; 
        include[0].through = { attributes: [] };
    }
    
    const plants = await Plant.findAll({
        where,
        include,
        attributes: { exclude: ['userId'] },
        order: [['createdAt', 'DESC']]
    });

    return plants;
};

const getPlantById = async (plantId) => {
    const plant = await Plant.findByPk(plantId, {
        include: PLANT_FULL_INCLUDE_OPTIONS,
        attributes: { exclude: ['userId'] }
    });

    if (!plant) {
        throw createError(StatusCodes.NOT_FOUND, 'Planta no encontrada.');
    }
    return plant;
};

const getUserPlants = async (userId) => {
    const plants = await Plant.findAll({
        where: { userId },
        include: [
            { model: AdoptionRequest, as: 'requests', attributes: ['id', 'requesterId', 'status'] },
            { model: Tag, as: 'tags' }
        ],
        attributes: { exclude: ['userId'] },
        order: [['createdAt', 'DESC']]
    });
    return plants;
};

const createPlant = async (plantData, tagIds, careData, imageUrl) => {
    
    if (imageUrl) {
        plantData.image_url = imageUrl; 
    }

    const newPlant = await Plant.create(plantData);

    if (tagIds && tagIds.length > 0) {
        const tags = await Tag.findAll({ where: { id: tagIds } });
        await newPlant.setTags(tags);
    }
    
    if (careData) {
        await PlantCare.create({ ...careData, plantId: newPlant.id });
    }

    const createdPlant = await Plant.findByPk(newPlant.id, {
        include: PLANT_FULL_INCLUDE_OPTIONS,
        attributes: { exclude: ['userId'] }
    });

    if (!createdPlant) {
        throw createError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error al confirmar la creación de la planta.');
    }

    return createdPlant;
};

const updatePlant = async (plantId, userId, plantData, tagIds, careData) => {
    const plant = await Plant.findByPk(plantId);

    if (!plant) {
        throw createError(StatusCodes.NOT_FOUND, 'Planta no encontrada.');
    }
    
    if (plant.userId !== userId) {
        throw createError(StatusCodes.FORBIDDEN, 'No tienes permiso para modificar esta planta.');
    }

    await plant.update(plantData);

    if (tagIds) {
        const tags = await Tag.findAll({ where: { id: tagIds } });
        await plant.setTags(tags); 
    }

    if (careData) {
        const existingCare = await PlantCare.findOne({ where: { plantId } });
        if (existingCare) {
            await existingCare.update(careData);
        } else {
            await PlantCare.create({ ...careData, plantId });
        }
    }

    const updatedPlant = await Plant.findByPk(plantId, {
        include: PLANT_FULL_INCLUDE_OPTIONS,
        attributes: { exclude: ['userId'] }
    });

    return updatedPlant;
};

const deletePlant = async (plantId, userId) => {
    const plant = await Plant.findByPk(plantId);

    if (!plant) {
        throw createError(StatusCodes.NOT_FOUND, 'Planta no encontrada.');
    }

    if (plant.userId !== userId) {
        throw createError(StatusCodes.FORBIDDEN, 'No tienes permiso para eliminar esta planta.');
    }

    await plant.destroy(); 
};


module.exports = {
    getPlants,
    getPlantById,
    createPlant,
    updatePlant,
    deletePlant,
    getUserPlants
};