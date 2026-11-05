const express = require("express");
const cors = require("cors");
const path = require("path");
const restaurantRoutes = require("./modules/restaurants/restaurant.routes");
const authRoutes = require("./modules/auth/auth.routes");
const dishRoutes = require("./modules/dishes/dish.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use(dishRoutes);

app.use((error, req, res, next) => {
    if (error.name === "MulterError") {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        return res.status(status).json({ error: error.message });
    }

    if (error.message === "Formato de imagem não permitido") {
        return res.status(400).json({ error: error.message });
    }

    return next(error);
});

module.exports = app;
