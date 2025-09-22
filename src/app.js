const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user.routes");
const { initDB } = require("./models/index");

dotenv.config();

const app = express();
app.use(express.json());


app.use("/api/users", userRoutes);


initDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT}`);
  });
});
