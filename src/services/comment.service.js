

const Comment = require("../models/comment.model");
const httpStatus = require('http-status');
const User = require('../models/user.model'); 

const createComment = async ({ plantId, userId, content }) => {

    const newComment = await Comment.create({ plantId, userId, content });


    const commentWithUser = await Comment.findByPk(newComment.id, {
        include: [{ model: User, attributes: ['name'] }]
    });

    return commentWithUser;
};

module.exports = {
    createComment
};