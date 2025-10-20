// archivo: app.js (MODIFICADO)

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const swaggerUi = require('swagger-ui-express'); // NUEVO
const YAML = require('yamljs'); // NUEVO
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes"); // NUEVO
const { initDB } = require("./models/index");

dotenv.config();

// Carga el archivo de documentación YAML
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
app.use(express.json());

app.use(morgan("dev")); // MORGAN para logging HTTP

// RUTAS DE DOCUMENTACIÓN
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

// RUTAS
app.use("/api/auth", authRoutes); // Ruta de Login/Auth
app.use("/api/users", userRoutes); 


initDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT}`);
    console.log(`📘 Documentación Swagger en http://localhost:${process.env.PORT}/api-docs`);
  });
});