require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.restaurant.createMany({
        data: [
            { name: "Pizzaria Napoli", category: "Pizza", rating: 4.5 },
            { name: "Burger House", category: "Burger", rating: 4.2 },
            { name: "Sushi Express", category: "Japonesa", rating: 4.8 }
        ],
        skipDuplicates: true
    });

    console.log("Dados inseridos com sucesso!");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
