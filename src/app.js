const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const swaggerUi = require('swagger-ui-express'); 
const YAML = require('yamljs'); 
const path = require('path');

const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const plantRoutes = require("./routes/plant.routes"); 

const { initDB } = require("./models/index");
const errorHandler = require('./middlewares/errorHandler'); 

dotenv.config();


const swaggerPath = path.resolve(__dirname, '..', 'swagger.yaml');
let swaggerDocument = {};
try {
  swaggerDocument = YAML.load(swaggerPath);
} catch (err) {
  console.warn('No se pudo cargar swagger.yaml:', err.message);
}

const app = express();
app.use(express.json());

app.use(morgan("dev")); 

if (swaggerDocument && Object.keys(swaggerDocument).length) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 
}


app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes); 
app.use("/api/plants", plantRoutes); 

app.use(errorHandler); 

const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    if (swaggerDocument && Object.keys(swaggerDocument).length) {
      console.log(`📘 Documentación Swagger en http://localhost:${PORT}/api-docs`);
    }
  });
}).catch(err => {
  console.error('No se pudo inicializar la base de datos:', err.message);
  process.exit(1);
});