const express = require("express");
const { body, param } = require("express-validator");
const messageController = require("../controllers/message.controller");
const { validateFields } = require("../middlewares/validateFields");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

const requestIdParamValidation = [
    param("requestId").isInt().withMessage("El ID de la solicitud (chat) debe ser un entero"),
    validateFields,
];

router.get("/:requestId", authMiddleware, requestIdParamValidation, messageController.getMessages);

router.post("/:requestId", authMiddleware, requestIdParamValidation, [
    body("content").notEmpty().withMessage("El contenido del mensaje no puede estar vacío"),
    validateFields,
], messageController.addMessage);

router.put("/:requestId/finalize", authMiddleware, requestIdParamValidation, messageController.finalizeAgreement);

module.exports = router;