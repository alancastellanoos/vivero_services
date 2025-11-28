module.exports = (db) => {
    const { User, Plant, Tag, PlantCare, AdoptionRequest, Message, PlantTag } = db;

    User.hasMany(Plant, { foreignKey: 'userId', as: 'plantsToAdopt' });
    Plant.belongsTo(User, { foreignKey: 'userId', as: 'Donator' });

    Plant.hasOne(PlantCare, { foreignKey: 'plantId', onDelete: 'CASCADE' });
    PlantCare.belongsTo(Plant, { foreignKey: 'plantId' });

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

    User.hasMany(AdoptionRequest, { foreignKey: 'requesterId', as: 'adoptionRequests' });
    AdoptionRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'Requester' });

    Plant.hasMany(AdoptionRequest, { foreignKey: 'plantId', as: 'requests' });
    AdoptionRequest.belongsTo(Plant, { foreignKey: 'plantId', as: 'Plant' });

    AdoptionRequest.hasMany(Message, { foreignKey: 'requestId', as: 'chatMessages', onDelete: 'CASCADE' });
    Message.belongsTo(AdoptionRequest, { foreignKey: 'requestId', as: 'Request' });

    User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
    Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });
};