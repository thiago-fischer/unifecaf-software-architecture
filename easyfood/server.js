const express = require("express");

const app = express();

app.use(express.json());
const restaurants = [
    {
        id: 1,
        name: "Pizzaria Napoli",
        category: "Pizza",
        rating: 4.8
    },
    {
        id: 2,
        name: "Burger House",
        category: "Hambúrguer",
        rating: 4.7
    },
    {
        id: 3,
        name: "Sushi House",
        category: "Japonês",
        rating: 4.9
    }
];

app.get("/restaurants", (req, res) => {
    res.json(restaurants);
});


app.post("/restaurants", (req, res) => {
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

    const restaurant = {
        id: restaurants.length + 1,
        name,
        category,
        rating: rating ?? 0
    };

    restaurants.push(restaurant);

    res.status(201).json(restaurant);
});


app.listen(3000, () => {
    console.log("EasyFood rodando na porta 3000");
});