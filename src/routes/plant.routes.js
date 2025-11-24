
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


router.get("/", getPlants); 


router.post("/", authMiddleware, plantBodyValidation, createPlant);


router.get("/:id", idValidation, getPlant);


router.put("/:id", authMiddleware, idValidation, plantBodyValidation, updatePlant);


router.delete("/:id", authMiddleware, idValidation, deletePlant);


router.post("/:id/adoptar", authMiddleware, idValidation, adoptPlant);


router.post("/:id/comentarios", authMiddleware, idValidation, [body("content").notEmpty().withMessage("El comentario no puede estar vacío.")], addComment);


module.exports = router;