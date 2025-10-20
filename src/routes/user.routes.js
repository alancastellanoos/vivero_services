// archivo: routes/user.routes.js (MODIFICADO)

const express = require("express");
const { body } = require("express-validator");
const { getUsers, addUser } = require("../controllers/user.controller");
const { validateFields } = require("../middlewares/validateFields");
const { authMiddleware } = require("../middlewares/authMiddleware"); // NUEVO

const router = express.Router();

// Ruta protegida por JWT
router.get("/", authMiddleware, getUsers); 

router.post(
    "/",
    [    
        // Se cambió 'nombre' por 'name' para consistencia con el Model
        body("name").notEmpty().withMessage("El nombre es obligatorio"),
        body("email").isEmail().withMessage("El correo no es válido"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("La contraseña debe tener al menos 6 caracteres"),
        validateFields,
    ], 
    addUser
);

module.exports = router;
