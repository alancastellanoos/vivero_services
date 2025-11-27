// src/models/associations.js

/**
 * Define y aplica todas las asociaciones entre los modelos.
 * @param {Object} db - Objeto que contiene todos los modelos inicializados (User, Plant, Tag, etc.).
 */
module.exports = (db) => {
    // Desestructuramos para acceder a los modelos
    const { User, Plant, Tag, PlantCare, AdoptionRequest, Message, PlantTag } = db;

    // --- 1. Relaciones de Planta (Publicación y Cuidado) ---
    
    // Un Usuario puede dar en adopción muchas Plantas (Donante)
    User.hasMany(Plant, { foreignKey: 'userId', as: 'plantsToAdopt' });
    Plant.belongsTo(User, { foreignKey: 'userId', as: 'Donator' });

    // Una Planta tiene un único PlantCare (1:1)
    Plant.hasOne(PlantCare, { foreignKey: 'plantId', onDelete: 'CASCADE' });
    PlantCare.belongsTo(Plant, { foreignKey: 'plantId' });

    // Una Planta tiene muchos Tags y un Tag pertenece a muchas Plantas (M:M)
    Plant.belongsToMany(Tag, { 
        through: PlantTag, 
        foreignKey: 'plantId', 
        otherKey: 'tagId', 
        as: 'tags' 
    });
    Tag.belongsToMany(Plant, { 
        through: PlantTag, 
        foreignKey: 'tagId', 
        otherKey: 'plantId', 
        as: 'plants' 
    });


    // --- 2. Relaciones de Solicitud de Adopción ---

    // Un Usuario puede hacer muchas solicitudes de adopción (Adoptante)
    User.hasMany(AdoptionRequest, { foreignKey: 'requesterId', as: 'adoptionRequests' });
    AdoptionRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'Requester' });

    // Una Planta puede recibir muchas solicitudes
    Plant.hasMany(AdoptionRequest, { foreignKey: 'plantId', as: 'requests' });
    AdoptionRequest.belongsTo(Plant, { foreignKey: 'plantId', as: 'Plant' });


    // --- 3. Relaciones de Mensajería (Chat) ---

    // Un mensaje pertenece a una Solicitud (ya ACEPTADA)
    AdoptionRequest.hasMany(Message, { foreignKey: 'requestId', as: 'chatMessages', onDelete: 'CASCADE' });
    Message.belongsTo(AdoptionRequest, { foreignKey: 'requestId', as: 'Request' });

    // Un Usuario puede enviar muchos Mensajes
    User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
    Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });
};