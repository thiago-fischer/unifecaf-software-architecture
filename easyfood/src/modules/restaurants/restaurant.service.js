const prisma = require("../../database/prisma");
const emailService = require("../shared/email.service");
const activityService = require("../shared/activity.service");

async function listRestaurants() {
    return prisma.restaurant.findMany();
}

async function createRestaurant(data, user) {
    const restaurant = await prisma.restaurant.create({
        data: {
            name: data.name,
            category: data.category,
            rating: data.rating || 0,
            ownerId: user.id
        }
    });

    try {
        await emailService.sendEmail({
            to: user.email,
            toName: restaurant.name,
            subject: `Bem-vindo à EasyFood, ${restaurant.name}!`,
            header: `Olá, ${restaurant.name}!`,
            body: `Seu restaurante foi cadastrado com sucesso na EasyFood.<br/>Categoria: ${restaurant.category}.`,
            footer: "Equipe EasyFood"
        });
    } catch (error) {
        console.error("Erro ao enviar e-mail de boas-vindas:", error.message);
    }

    try {
        await activityService.log(
            "RESTAURANT_CREATED",
            `Restaurante ${restaurant.name} criado pelo usuário ${user.id}`
        );
    } catch (error) {
        console.error("Erro ao registrar atividade:", error.message);
    }

    try {
        if (!process.env.EMAIL_TO) {
            throw new Error("EMAIL_TO não foi definido");
        }
        await emailService.sendEmail({
            to: process.env.EMAIL_TO,
            toName: "Comercial EasyFood",
            subject: `Novo restaurante cadastrado: ${restaurant.name}`,
            header: "Novo restaurante na plataforma",
            body: `Nome: ${restaurant.name}<br/>Categoria: ${restaurant.category}<br/>Avaliação: ${restaurant.rating}`,
            footer: "Notificação automática - EasyFood"
        });
    } catch (error) {
        console.error("Erro ao notificar o comercial:", error.message);
    }

    return restaurant;
}

module.exports = {
    listRestaurants,
    createRestaurant
};
