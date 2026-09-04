const restaurantService = require("./restaurant.service");

async function list(req, res) {
    try {
        const restaurants = await restaurantService.listRestaurants();
        res.json(restaurants);
    } catch (error) {
        console.error("Erro ao buscar restaurantes:", error.message);
        res.status(500).json({
            error: "Erro interno do servidor"
        });
    }
}

async function create(req, res) {
    const { name, category, rating } = req.body ?? {};

    if (!name || !category) {
        return res.status(400).json({
            error: "Nome e categoria são obrigatórios"
        });
    }

    if (rating !== undefined && typeof rating !== "number") {
        return res.status(400).json({
            error: "A avaliação deve ser um número"
        });
    }

    if (rating !== undefined && (rating < 0 || rating > 5)) {
        return res.status(400).json({
            error: "A avaliação deve estar entre 0 e 5"
        });
    }

    try {
        const restaurant = await restaurantService.createRestaurant({
            name,
            category,
            rating
        });

        res.status(201).json(restaurant);
    } catch (error) {
        console.error("Erro ao cadastrar restaurante:", error.message);
        res.status(500).json({
            error: "Erro interno do servidor"
        });
    }
}

module.exports = { list, create };
