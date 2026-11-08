const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../../database/prisma");
const { JWT_SECRET } = require("./auth.config");
const imageService = require("../shared/image.service");

function publicUser(user) {
    return { id: user.id, name: user.name, email: user.email, imageUrl: user.imageUrl };
}

async function register({ name, email, password }) {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { name, email, password: hash }
    });
    return publicUser(user);
}

async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return null;
    }

    const token = jwt.sign(
        { sub: user.id, email: user.email },
        JWT_SECRET,
        { algorithm: "HS256", expiresIn: "1d" }
    );
    return { token, user: publicUser(user) };
}

async function getUserById(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? publicUser(user) : null;
}

async function updateProfileImage(id, buffer) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        const error = new Error("Usuário não encontrado");
        error.statusCode = 404;
        throw error;
    }

    const imageUrl = await imageService.optimizeImage(buffer, "profile");
    const updatedUser = await prisma.user.update({
        where: { id },
        data: { imageUrl }
    });
    return publicUser(updatedUser);
}

module.exports = { register, login, getUserById, updateProfileImage };
