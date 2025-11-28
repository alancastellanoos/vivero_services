const express = require("express");
const { body, param, query } = require("express-validator");
const plantController = require("../controllers/plant.controller");
const { validateFields } = require("../middlewares/validateFields");
const { authMiddleware } = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/upload"); 

const router = express.Router();

const plantIdValidation = [
    param("id").isInt().withMessage("El ID de la planta debe ser un número entero"),
    validateFields,
];

const plantCreationValidation = [
    body("data").exists().withMessage("Faltan los datos de la planta."),

    body('data')
        .custom((value, { req }) => {
            try {
                req.parsedPlantData = JSON.parse(value);
                return true;
            } catch (error) {
                throw new Error("El formato de los datos de la planta es inválido (JSON mal formado).");
            }
        }),

    body("data")
        .custom((value, { req }) => {
            const data = req.parsedPlantData;
            
            if (!data.name || data.name.trim() === "") {
                throw new Error("El nombre de la planta es obligatorio.");
            }
            if (!data.description || data.description.trim() === "") {
                throw new Error("La descripción es obligatoria.");
            }
            if (!data.location || data.location.trim() === "") {
                throw new Error("La ubicación es obligatoria.");
            }
            
            if (!data.PlantCare) {
                throw new Error("Faltan los datos de cuidado.");
            }
            if (!data.PlantCare.light || data.PlantCare.light.trim() === "") {
                throw new Error("La información de luz es obligatoria.");
            }
             if (!data.PlantCare.watering || data.PlantCare.watering.trim() === "") {
                throw new Error("La información de riego es obligatoria.");
            }
            
            if (data.tagIds && !Array.isArray(data.tagIds)) {
                throw new Error("tagIds debe ser un array de IDs de tags.");
            }
            
            return true;
        }),
        
    validateFields, 
];

router.get("/", [
    query("isCatalog").isBoolean().optional().withMessage("El filtro isCatalog debe ser booleano"),
    query("status").isIn(['AVAILABLE', 'ADOPTED']).optional().withMessage("Estatus no válido"),
    validateFields,
], plantController.getPlants);

router.get("/my-plants", authMiddleware, plantController.getUserPlants);

router.post(
    "/", 
    authMiddleware,         
    uploadMiddleware,       
    plantCreationValidation, 
    plantController.addPlant 
);

router.get("/:id", plantIdValidation, plantController.getPlant);

router.put("/:id", authMiddleware, plantIdValidation, plantController.updatePlant);

router.delete("/:id", authMiddleware, plantIdValidation, plantController.deletePlant);

module.exports = router;