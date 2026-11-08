const dishService = require("./dish.service");

async function create(req, res) {
    try {
        const dish = await dishService.createDish(req.params.restaurantId, req.body, req.user.id);
        return res.status(201).json(dish);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.statusCode ? error.message : "Erro interno ao cadastrar prato"
        });
    }
}

async function getById(req, res) {
    try {
        return res.json(await dishService.getDish(req.params.dishId));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.statusCode ? error.message : "Erro ao consultar prato"
        });
    }
}

async function update(req, res) {
    try {
        return res.json(await dishService.updateDish(req.params.dishId, req.body, req.user.id));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.statusCode ? error.message : "Erro ao atualizar prato"
        });
    }
}

async function remove(req, res) {
    try {
        await dishService.deleteDish(req.params.dishId, req.user.id);
        return res.status(204).send();
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.statusCode ? error.message : "Erro ao excluir prato"
        });
    }
}

async function list(req, res) {
    try {
        const dishes = await dishService.listDishes(req.params.restaurantId);
        return res.json(dishes);
    } catch (error) {
        return res.status(500).json({
            error: "Erro ao consultar pratos"
        });
    }
}

async function uploadImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Nenhuma imagem enviada"
            });
        }

        const dish = await dishService.uploadDishImage(req.params.dishId, req.file.buffer, req.user.id);
        return res.json(dish);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.statusCode ? error.message : "Erro ao processar imagem"
        });
    }
}

module.exports = {
    create,
    list,
    getById,
    update,
    remove,
    uploadImage
};
