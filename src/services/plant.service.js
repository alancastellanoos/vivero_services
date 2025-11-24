

const Plant = require("../models/plant.model");
const Photo = require("../models/photo.model");
const Tag = require("../models/tag.model");
const httpStatus = require('http-status');
const { User } = require("../models"); 


const processTags = async (plant, tagNames) => {
    if (!tagNames || tagNames.length === 0) return;

    const tags = await Promise.all(tagNames.map(name => 
        Tag.findOrCreate({ where: { name: name.toLowerCase() }, defaults: { name } })
    ));

    const tagInstances = tags.map(result => result[0]);
    await plant.setTags(tagInstances);
};


const createPlant = async (plantData, ownerId, photos, tags) => {
    const newPlant = await Plant.create({ ...plantData, ownerId });
    

    if (photos && photos.length > 0) {
        await Photo.bulkCreate(photos.map(url => ({ url, plantId: newPlant.id, isPrimary: photos[0] === url })));
    }
    

    await processTags(newPlant, tags);
    
    return Plant.findByPk(newPlant.id, {
        include: [Photo, Tag]
    });
};


const getPlants = async ({ tag, status }) => {
    const where = {};
    const include = [
        { model: Photo, attributes: ['url', 'isPrimary'] },
        { model: Tag, attributes: ['name'] },
        { model: User, as: 'Owner', attributes: ['name', 'email'] }
    ];

    if (status && ['available', 'adopted'].includes(status)) {
        where.status = status;
    }


    if (tag) {
        
        include[1].where = { name: tag.toLowerCase() };
    }

    return Plant.findAll({ where, include });
};


const getPlantById = async (id) => {
    const plant = await Plant.findByPk(id, {
        include: [
            { model: Photo, attributes: ['url', 'isPrimary'] },
            { model: Tag, attributes: ['name'] },
            { model: User, as: 'Owner', attributes: ['name', 'email'] },
            
            { model: require("../models/comment.model"), include: [{ model: User, attributes: ['name'] }] } 
        ]
    });
    if (!plant) {
        const error = new Error('Planta no encontrada.');
        error.customStatus = httpStatus.NOT_FOUND;
        throw error;
    }
    return plant;
};


const updatePlant = async (id, ownerId, plantData, tags) => {
    const plant = await Plant.findByPk(id);

    if (!plant) {
        const error = new Error('Planta no encontrada.');
        error.customStatus = httpStatus.NOT_FOUND;
        throw error;
    }
    if (plant.ownerId !== ownerId) {
        const error = new Error('No tienes permiso para editar esta planta.');
        error.customStatus = httpStatus.FORBIDDEN; 
    }

    await plant.update(plantData);
    await processTags(plant, tags);

    return Plant.findByPk(id, { include: [Photo, Tag] });
};


const deletePlant = async (id, ownerId) => {
    const plant = await Plant.findByPk(id);

    if (!plant) {
        const error = new Error('Planta no encontrada.');
        error.customStatus = httpStatus.NOT_FOUND;
        throw error;
    }
    if (plant.ownerId !== ownerId) {
        const error = new Error('No tienes permiso para eliminar esta planta.');
        error.customStatus = httpStatus.FORBIDDEN;
        throw error;
    }

    await plant.destroy();
};



const adoptPlant = async (plantId, adopterId) => {
    const plant = await Plant.findByPk(plantId);
    
    if (!plant) {
        const error = new Error('Planta no encontrada.');
        error.customStatus = httpStatus.NOT_FOUND;
        throw error;
    }
    if (plant.status !== 'available') {
        const error = new Error('Esta planta ya no está disponible para adopción.');
        error.customStatus = httpStatus.BAD_REQUEST;
        throw error;
    }
    if (plant.ownerId === adopterId) {
        const error = new Error('No puedes adoptar tu propia planta.');
        error.customStatus = httpStatus.BAD_REQUEST;
        throw error;
    }

    await plant.update({ status: 'adopted', adopterId });
    return plant;
};

module.exports = {
  createPlant,
  getPlants,
  getPlantById,
  updatePlant,
  deletePlant,
  adoptPlant
};