// archivo: models/planttag.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 
const Plant = require('./plant.model');
const Tag = require('./tag.model');

const PlantTag = sequelize.define('PlantTag', {}, { timestamps: false });

// Definir asociaciones de Muchos a Muchos
Plant.belongsToMany(Tag, { through: PlantTag, foreignKey: 'plantId' });
Tag.belongsToMany(Plant, { through: PlantTag, foreignKey: 'tagId' });

module.exports = PlantTag;