
const express = require("express");
const { body } = require("express-validator");
const { login } = require("../controllers/authController");
const { validateFields } = require("../middlewares/validateFields");

const router = express.Router();

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("El correo no es válido"),
        body("password").notEmpty().withMessage("La contraseña es obligatoria"),
        validateFields,
    ],
    login
);

module.exports = router;