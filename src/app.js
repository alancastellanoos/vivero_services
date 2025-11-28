const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const swaggerUi = require('swagger-ui-express'); 
const YAML = require('yamljs'); 
const path = require('path');
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 
const cors = require('cors'); 

// --- Importación de Nuevas Rutas ---
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const plantRoutes = require("./routes/plant.routes"); 
const requestRoutes = require("./routes/request.routes"); // Nueva ruta
const messageRoutes = require("./routes/message.routes"); // Nueva ruta

const { initDB } = require("./models/index");
const errorHandler = require('./middlewares/errorHandler'); // Importación del middleware de manejo de errores

dotenv.config();


const swaggerPath = path.resolve(__dirname, 'uploads', 'swagger.yaml');
let swaggerDocument = {};
try {
  swaggerDocument = YAML.load(swaggerPath);
} catch (err) {
  console.warn('No se pudo cargar swagger.yaml. Asegúrate de que el archivo existe y es accesible.');
}

const app = express();

// *************************************************************************
// **** CORRECCIÓN CLAVE PARA EXPRESS-RATE-LIMIT Y PROXIES (NGRKO) ****
// *************************************************************************
// Habilitar 'trust proxy' para que Express reconozca que está detrás de ngrok 
// (u otro proxy) y pueda leer correctamente la IP del cliente del header 
// 'X-Forwarded-For', lo cual es crucial para el Rate Limiting.
app.set('trust proxy', 1); 
// *************************************************************************

// *************************************************************************
// **** CONFIGURACIÓN DE CORS: LISTA BLANCA POR SEGURIDAD ****
// *************************************************************************

// 1. Define los orígenes (dominios) que pueden acceder a tu API.
const whitelist = [
    // El dominio público de ngrok (necesario para el celular)
    'https://nonalphabetically-endoplasmic-coral.ngrok-free.dev', 
    // Live Server local (para pruebas en tu PC)
    'http://127.0.0.1:5500', 
    'http://localhost:5500' // Por si acaso usas localhost en lugar de 127.0.0.1
];

const corsOptions = {
    origin: function (origin, callback) {
        // Si el origen no está presente (ej. Postman) O está en la lista blanca, permitir acceso.
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            // Rechazar cualquier otro origen
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Importante si usas cookies o sesiones
};

// Aplica la lista blanca de CORS
app.use(cors(corsOptions));
// *************************************************************************


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos."
  }
});
app.use(limiter);


app.use(express.json());


app.use(morgan("dev")); 
// app.use(helmet()); // Opcional: Recomendado para seguridad

// **********************************************
// **** CORRECCIÓN CLAVE ****
// **********************************************
// Retrocede un nivel ('..') para salir de 'src' y encontrar 'uploads'
const UPLOADS_PATH = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(UPLOADS_PATH));
// **********************************************
if (swaggerDocument && Object.keys(swaggerDocument).length) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 
}

// --- Uso de Rutas de la API ---
app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes); 
app.use("/api/plants", plantRoutes); 
app.use("/api/requests", requestRoutes); // Uso de la nueva ruta de Solicitudes
app.use("/api/messages", messageRoutes); // Uso de la nueva ruta de Mensajería

// --- Manejo de Errores (Debe ir después de todas las rutas) ---
app.use(errorHandler);


const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    if (swaggerDocument && Object.keys(swaggerDocument).length) {
      console.log(` Documentación Swagger en http://localhost:${PORT}/api-docs`);
    }
  });
}).catch(err => {
  console.error('No se pudo inicializar la base de datos:', err.message);
  process.exit(1);
});