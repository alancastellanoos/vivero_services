// archivo: routes/plant.routes.js

const express = require("express");
const { body, param } = require("express-validator");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateFields } = require("../middlewares/validateFields");
const { 
    createPlant, 
    getPlants, 
    getPlant, 
    updatePlant, 
    deletePlant, 
    adoptPlant, 
    addComment 
} = require("../controllers/plant.controller");

const router = express.Router();

// --- Validaciones Reutilizables ---
const idValidation = [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    validateFields,
];
const plantBodyValidation = [
    body("title").notEmpty().withMessage("El título es obligatorio."),
    body("description").notEmpty().withMessage("La descripción es obligatoria."),
    body("photos").isArray().withMessage("Las fotos deben ser un array de URLs."),
    body("tags").isArray().withMessage("Los tags deben ser un array de strings."),
    validateFields,
];

// ------------------------------------
// RUTAS
// ------------------------------------

// [READ ALL] - GET /api/plants (Permite buscar por tag o status)
router.get("/", getPlants); 

// [CREATE] - POST /api/plants (Protegida)
router.post("/", authMiddleware, plantBodyValidation, createPlant);

// [READ ONE] - GET /api/plants/:id
router.get("/:id", idValidation, getPlant);

// [UPDATE] - PUT /api/plants/:id (Protegida - Solo dueño)
router.put("/:id", authMiddleware, idValidation, plantBodyValidation, updatePlant);

// [DELETE] - DELETE /api/plants/:id (Protegida - Solo dueño)
router.delete("/:id", authMiddleware, idValidation, deletePlant);

// [ADOPT] - POST /api/plants/:id/adoptar (Funcionalidad UX)
router.post("/:id/adoptar", authMiddleware, idValidation, adoptPlant);

// [COMMENT] - POST /api/plants/:id/comentarios (Funcionalidad UX)
router.post("/:id/comentarios", authMiddleware, idValidation, [body("content").notEmpty().withMessage("El comentario no puede estar vacío.")], addComment);


module.exports = router;