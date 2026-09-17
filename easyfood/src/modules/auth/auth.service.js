const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../../database/prisma");
const { JWT_SECRET } = require("./auth.config");

function publicUser(user) {
    return { id: user.id, name: user.name, email: user.email };
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

module.exports = { register, login };
