const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "chave-exclusiva-dos-testes-de-autenticacao";

// Substitui apenas a persistência; HTTP, bcrypt e JWT são executados de verdade.
const users = [];
const restaurants = [];
const prismaPath = require.resolve("../src/database/prisma");
require.cache[prismaPath] = {
    id: prismaPath,
    filename: prismaPath,
    loaded: true,
    exports: {
        user: {
            async create({ data }) {
                if (users.some(user => user.email === data.email)) {
                    throw Object.assign(new Error("Duplicate"), { code: "P2002" });
                }
                const user = { id: users.length + 1, ...data };
                users.push(user);
                return user;
            },
            async findUnique({ where }) {
                return users.find(user => user.email === where.email) ?? null;
            }
        },
        restaurant: {
            async findMany() { return restaurants; },
            async create({ data }) {
                const restaurant = { id: restaurants.length + 1, ...data };
                restaurants.push(restaurant);
                return restaurant;
            }
        }
    }
};

let server;
let baseUrl;
before(async () => {
    server = require("../src/app").listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function request(path, { method = "GET", body, authorization } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (authorization) headers.Authorization = authorization;
    const response = await fetch(`${baseUrl}${path}`, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
}

test("cadastro, hash, duplicidade, login e acesso autenticado", async () => {
    const credentials = { name: "Aluno", email: "aluno@easyfood.com", password: "123456" };
    const registered = await request("/auth/register", { method: "POST", body: credentials });
    assert.equal(registered.status, 201);
    assert.deepEqual(registered.body, { id: 1, name: credentials.name, email: credentials.email });
    assert.notEqual(users[0].password, credentials.password);
    assert.equal(await bcrypt.compare(credentials.password, users[0].password), true);
    assert.equal(bcrypt.getRounds(users[0].password), 10);
    assert.equal((await request("/auth/register", { method: "POST", body: credentials })).status, 409);

    for (const body of [
        { email: credentials.email, password: "errada" },
        { email: "inexistente@easyfood.com", password: credentials.password }
    ]) {
        const result = await request("/auth/login", { method: "POST", body });
        assert.equal(result.status, 401);
        assert.equal(result.body.error, "Credenciais inválidas");
    }

    const logged = await request("/auth/login", { method: "POST", body: credentials });
    assert.equal(logged.status, 200);
    assert.deepEqual(logged.body.user, registered.body);
    const payload = jwt.verify(logged.body.token, process.env.JWT_SECRET);
    assert.equal(payload.sub, registered.body.id);
    assert.equal(payload.exp - payload.iat, 86400);
    const authorization = `Bearer ${logged.body.token}`;
    const me = await request("/auth/me", { authorization });
    assert.equal(me.status, 200);
    assert.deepEqual(me.body.user, { id: 1, email: credentials.email });
    const restaurant = await request("/restaurants", {
        method: "POST", authorization, body: { name: "Restaurante teste", category: "Pizza", rating: 4 }
    });
    assert.equal(restaurant.status, 201);
    assert.equal((await request("/restaurants")).status, 200);
});

test("validação dos campos e limite de bytes do bcrypt", async () => {
    for (const path of ["/auth/register", "/auth/login"]) {
        for (const body of [undefined, {}, { name: "A", email: 123, password: "123456" },
            { name: "A", email: "a@b.com", password: {} },
            { name: "A", email: " ", password: "123456" }]) {
            assert.equal((await request(path, { method: "POST", body })).status, 400);
        }
    }
    for (const body of [
        { name: "a".repeat(151), email: "a@b.com", password: "123456" },
        { name: "A", email: "a".repeat(151), password: "123456" },
        { name: "A", email: "a@b.com", password: "á".repeat(37) }
    ]) {
        assert.equal((await request("/auth/register", { method: "POST", body })).status, 400);
    }
});

test("rotas protegidas recusam tokens ausentes, inválidos e expirados", async () => {
    const payload = { sub: 1, email: "aluno@easyfood.com" };
    const sign = (claims, secret = process.env.JWT_SECRET, options = {}) =>
        jwt.sign(claims, secret, { expiresIn: "1d", ...options });
    const invalidHeaders = [undefined, "Basic abc", "Bearer ", "Bearer invalido", "Bearer a b",
        `Bearer ${sign(payload, "outra-chave")}`,
        `Bearer ${sign(payload, undefined, { expiresIn: -1 })}`,
        `Bearer ${sign(payload, undefined, { algorithm: "HS384" })}`,
        `Bearer ${sign({ email: payload.email })}`,
        `Bearer ${jwt.sign(payload, process.env.JWT_SECRET)}`];
    const count = restaurants.length;
    for (const authorization of invalidHeaders) {
        assert.equal((await request("/auth/me", { authorization })).status, 401);
        assert.equal((await request("/restaurants", {
            method: "POST", authorization, body: { name: "Bloqueado", category: "Pizza" }
        })).status, 401);
    }
    assert.equal(restaurants.length, count);
    assert.equal((await request("/restaurants")).status, 200);
});
