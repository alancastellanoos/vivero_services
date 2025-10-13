const express = require("express");
const { body } = require("express-validator");
const { getUsers, addUser } = require("../controllers/user.controller");
const { validateFields } = require("../middlewares/validateFields");

const router = express.Router();


router.get("/", getUsers);
router.post(
    "/",
    [    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("El correo no es válido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    validateFields,
    ], 
    addUser
);

module.exports = router;
