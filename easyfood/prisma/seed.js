require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const password = await bcrypt.hash("easyfood123", 10);
    const owner = await prisma.user.upsert({
        where: { email: "demo@easyfood.com" },
        update: {},
        create: {
            name: "Usuário de demonstração",
            email: "demo@easyfood.com",
            password
        }
    });

    await prisma.restaurant.createMany({
        data: [
            { name: "Pizzaria Napoli", category: "Pizza", rating: 4.5, ownerId: owner.id },
            { name: "Burger House", category: "Burger", rating: 4.2, ownerId: owner.id },
            { name: "Sushi Express", category: "Japonesa", rating: 4.8, ownerId: owner.id }
        ]
    });

    console.log("Dados inseridos com sucesso! Login: demo@easyfood.com / easyfood123");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
