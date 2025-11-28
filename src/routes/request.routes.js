const express = require("express");
const { body, param } = require("express-validator");
const requestController = require("../controllers/request.controller");
const { validateFields } = require("../middlewares/validateFields");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

const requestIdValidation = [
    param("id").isInt().withMessage("El ID de la solicitud debe ser un número entero"),
    validateFields,
];

router.post("/", authMiddleware, [
    body("plantId").isInt().withMessage("El ID de la planta es obligatorio y debe ser un entero"),
    body("message").isString().optional().withMessage("El mensaje debe ser texto"),
    validateFields,
], requestController.addRequest);

router.get("/outgoing", authMiddleware, requestController.getOutgoingRequests);

router.get("/incoming", authMiddleware, requestController.getIncomingRequests);

router.put("/:id/accept", authMiddleware, requestIdValidation, requestController.acceptRequest);

router.put("/:id/reject", authMiddleware, requestIdValidation, requestController.rejectRequest);

module.exports = router;