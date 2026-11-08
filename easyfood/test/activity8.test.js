const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "chave-exclusiva-dos-testes-da-atividade-8";

const users = [{ id: 1, name: "Aluno", email: "aluno@easyfood.com", password: "hash", imageUrl: null }];
const restaurants = [{ id: 1, name: "Pizzaria" }];
const dishes = [{ id: 1, name: "Pizza", description: "Queijo", price: 40, restaurantId: 1, imageUrl: null }];

const prismaPath = require.resolve("../src/database/prisma");
require.cache[prismaPath] = {
    id: prismaPath,
    filename: prismaPath,
    loaded: true,
    exports: {
        user: {
            async findUnique({ where }) {
                return users.find(user => where.id ? user.id === where.id : user.email === where.email) ?? null;
            },
            async update({ where, data }) {
                const user = users.find(item => item.id === where.id);
                Object.assign(user, data);
                return user;
            }
        },
        restaurant: {
            async findUnique({ where }) {
                return restaurants.find(restaurant => restaurant.id === where.id) ?? null;
            }
        },
        dish: {
            async findUnique({ where }) {
                return dishes.find(dish => dish.id === where.id) ?? null;
            },
            async update({ where, data }) {
                const dish = dishes.find(item => item.id === where.id);
                Object.assign(dish, data);
                return dish;
            }
        }
    }
};

const imageServicePath = require.resolve("../src/modules/shared/image.service");
require.cache[imageServicePath] = {
    id: imageServicePath,
    filename: imageServicePath,
    loaded: true,
    exports: {
        async optimizeImage(_buffer, type) {
            return `/uploads/${type === "profile" ? "profiles" : "dishes"}/test.webp`;
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

function token() {
    return jwt.sign({ sub: 1, email: users[0].email }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

function imageForm(type = "image/png") {
    const form = new FormData();
    form.append("image", new Blob([new Uint8Array([137, 80, 78, 71])], { type }), "image.png");
    return form;
}

async function request(path, { method = "GET", authorization, body } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: authorization ? { Authorization: authorization } : undefined,
        body
    });
    return { status: response.status, body: await response.json() };
}

test("envia imagem para o perfil do usuário autenticado", async () => {
    const result = await request("/auth/me/image", {
        method: "POST", authorization: `Bearer ${token()}`, body: imageForm()
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.user.imageUrl, "/uploads/profiles/test.webp");
    assert.equal(users[0].imageUrl, "/uploads/profiles/test.webp");
});

test("protege uploads e rejeita arquivo que não é imagem", async () => {
    assert.equal((await request("/auth/me/image", { method: "POST", body: imageForm() })).status, 401);
    const invalid = await request("/auth/me/image", {
        method: "POST", authorization: `Bearer ${token()}`, body: imageForm("text/plain")
    });
    assert.equal(invalid.status, 400);
});

test("atualiza a imagem de um prato e informa prato inexistente", async () => {
    const uploaded = await request("/dishes/1/image", {
        method: "POST", authorization: `Bearer ${token()}`, body: imageForm()
    });
    assert.equal(uploaded.status, 200);
    assert.equal(uploaded.body.imageUrl, "/uploads/dishes/test.webp");

    const missing = await request("/dishes/99/image", {
        method: "POST", authorization: `Bearer ${token()}`, body: imageForm()
    });
    assert.equal(missing.status, 404);
});
