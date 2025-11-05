// archivo: services/comment.service.js

const Comment = require("../models/comment.model");
const httpStatus = require('http-status');
const User = require('../models/user.model'); 

const createComment = async ({ plantId, userId, content }) => {
    // La validación de que la planta y el usuario existen la maneja Sequelize (Foreign Keys)
    const newComment = await Comment.create({ plantId, userId, content });

    // Incluir el nombre del usuario para el retorno
    const commentWithUser = await Comment.findByPk(newComment.id, {
        include: [{ model: User, attributes: ['name'] }]
    });

    return commentWithUser;
};

module.exports = {
    createComment
};