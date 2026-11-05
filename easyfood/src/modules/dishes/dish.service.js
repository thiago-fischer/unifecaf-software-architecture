const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");

async function createDish(restaurantId, data) {
    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: Number(restaurantId)
        }
    });

    if (!restaurant) {
        const error = new Error("Restaurante não encontrado");
        error.statusCode = 404;
        throw error;
    }

    return prisma.dish.create({
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
            restaurantId: Number(restaurantId)
        }
    });
}

async function listDishes(restaurantId) {
    return prisma.dish.findMany({
        where: {
            restaurantId: Number(restaurantId)
        }
    });
}

async function uploadDishImage(dishId, buffer) {
    const dish = await prisma.dish.findUnique({
        where: {
            id: Number(dishId)
        }
    });

    if (!dish) {
        const error = new Error("Prato não encontrado");
        error.statusCode = 404;
        throw error;
    }

    const imageUrl = await imageService.optimizeImage(buffer);

    return prisma.dish.update({
        where: {
            id: Number(dishId)
        },
        data: {
            imageUrl
        }
    });
}

module.exports = {
    createDish,
    listDishes,
    uploadDishImage
};
