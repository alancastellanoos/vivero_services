const express = require("express");
const { body, param, query } = require("express-validator");
const plantController = require("../controllers/plant.controller");
const { validateFields } = require("../middlewares/validateFields");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// --- Validaciones Reutilizables ---

const plantIdValidation = [
    param("id").isInt().withMessage("El ID de la planta debe ser un número entero"),
    validateFields,
];

const plantCreationValidation = [
    body("plantData.name").notEmpty().withMessage("El nombre de la planta es obligatorio"),
    body("plantData.description").notEmpty().withMessage("La descripción es obligatoria"),
    body("plantData.isCatalog").isBoolean().optional().withMessage("isCatalog debe ser booleano"),
    // Validaciones condicionales para el Catálogo/Cuidados
    body("careData.light")
        .if(body("plantData.isCatalog").exists().equals(true))
        .notEmpty().withMessage("La información de luz es obligatoria para el catálogo"),
    // Validación de Tags (asumiendo que tagIds es un array de enteros)
    body("tagIds").isArray().optional().withMessage("tagIds debe ser un array de IDs de tags"),
    validateFields,
];

// --- Rutas ---

// GET /api/plants: Obtener la galería principal (sin Auth, para la vista pública)
router.get("/", [
    query("isCatalog").isBoolean().optional().withMessage("El filtro isCatalog debe ser booleano"),
    query("status").isIn(['AVAILABLE', 'ADOPTED']).optional().withMessage("Estatus no válido"),
    validateFields,
], plantController.getPlants);

// GET /api/plants/my-plants: Obtener las plantas publicadas por el usuario (Mi Perfil)
router.get("/my-plants", authMiddleware, plantController.getUserPlants);

// POST /api/plants: Crear una nueva planta (requiere Auth)
router.post("/", authMiddleware, plantCreationValidation, plantController.addPlant);

// GET /api/plants/:id: Obtener el detalle de una planta (sin Auth)
router.get("/:id", plantIdValidation, plantController.getPlant);

// PUT /api/plants/:id: Actualizar una planta (requiere Auth, solo el dueño)
router.put("/:id", authMiddleware, plantIdValidation, plantController.updatePlant);

// DELETE /api/plants/:id: Eliminar una planta (requiere Auth, solo el dueño)
router.delete("/:id", authMiddleware, plantIdValidation, plantController.deletePlant);

module.exports = router;