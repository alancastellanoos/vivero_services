const express = require("express");
const { body, param } = require("express-validator");
const requestController = require("../controllers/request.controller");
const { validateFields } = require("../middlewares/validateFields");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// --- Validaciones Reutilizables ---

const requestIdValidation = [
    param("id").isInt().withMessage("El ID de la solicitud debe ser un número entero"),
    validateFields,
];

// --- Rutas ---

// POST /api/requests: Crear una nueva solicitud de adopción (requiere Auth)
router.post("/", authMiddleware, [
    body("plantId").isInt().withMessage("El ID de la planta es obligatorio y debe ser un entero"),
    body("message").isString().optional().withMessage("El mensaje debe ser texto"),
    validateFields,
], requestController.addRequest);

// GET /api/requests/incoming: Obtener solicitudes recibidas por el usuario logueado (Mi Perfil)
router.get("/incoming", authMiddleware, requestController.getIncomingRequests);

// PUT /api/requests/:id/accept: Aceptar una solicitud (requiere Auth, solo el Donante)
router.put("/:id/accept", authMiddleware, requestIdValidation, requestController.acceptRequest);

// PUT /api/requests/:id/reject: Rechazar una solicitud (requiere Auth, solo el Donante)
router.put("/:id/reject", authMiddleware, requestIdValidation, requestController.rejectRequest);

module.exports = router;