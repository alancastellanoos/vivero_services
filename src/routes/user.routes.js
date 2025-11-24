const express = require("express");
const { body, param } = require("express-validator");
const { 
  getUsers, 
  getUser, 
  addUser, 
  updateUser, 
  deleteUser 
} = require("../controllers/user.controller");
const { validateFields } = require("../middlewares/validateFields");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();


const userValidation = [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("El correo no es válido"),
    validateFields,
];


const idValidation = [
    param("id").isInt().withMessage("El ID debe ser un número entero"),
    validateFields,
];


const postValidation = [
    ...userValidation,
    body("password")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),
    validateFields,
];


const putValidation = [
    ...idValidation, 
    ...userValidation, 
    body("password")
        .optional()
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),
    validateFields,
];

router.get("/", authMiddleware, getUsers);


router.post("/", postValidation, addUser);


router.get("/:id", authMiddleware, idValidation, getUser);


router.put("/:id", authMiddleware, putValidation, updateUser);


router.delete("/:id", authMiddleware, idValidation, deleteUser);


module.exports = router;