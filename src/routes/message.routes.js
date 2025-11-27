const express = require("express");
const { body, param } = require("express-validator");
const messageController = require("../controllers/message.controller");
const { validateFields } = require("../middlewares/validateFields");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// --- Validaciones Reutilizables ---

const requestIdParamValidation = [
    param("requestId").isInt().withMessage("El ID de la solicitud (chat) debe ser un entero"),
    validateFields,
];

// --- Rutas ---

// GET /api/messages/:requestId: Obtener el historial de mensajes del chat (requiere Auth)
router.get("/:requestId", authMiddleware, requestIdParamValidation, messageController.getMessages);

// POST /api/messages/:requestId: Enviar un nuevo mensaje (requiere Auth)
router.post("/:requestId", authMiddleware, requestIdParamValidation, [
    body("content").notEmpty().withMessage("El contenido del mensaje no puede estar vacío"),
    validateFields,
], messageController.addMessage);

// PUT /api/messages/:requestId/finalize: Marcar el acuerdo como cerrado/entregado (requiere Auth)
router.put("/:requestId/finalize", authMiddleware, requestIdParamValidation, messageController.finalizeAgreement);

module.exports = router;