const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const userRoutes = require("./routes/user.routes");
const { initDB } = require("./models/index");

dotenv.config();

const app = express();
app.use(express.json());

app.use(morgan("dev"));

app.use("/api/users", userRoutes);


initDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT}`);
  });
});
