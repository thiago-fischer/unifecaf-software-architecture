const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "chave-exclusiva-dos-testes-da-atividade-8";

const users = [{ id: 1, name: "Aluno", email: "aluno@easyfood.com", password: "hash", imageUrl: null }];
const restaurants = [{ id: 1, name: "Pizzaria", ownerId: 1 }];
const dishes = [{ id: 1, name: "Pizza", category: "Pizza", description: "Queijo", price: 40, restaurantId: 1, imageUrl: null }];
const activities = [];

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
            async create({ data }) {
                const dish = { id: dishes.length + 1, imageUrl: null, ...data };
                dishes.push(dish);
                return dish;
            },
            async findMany({ where }) {
                return dishes.filter(dish => dish.restaurantId === where.restaurantId);
            },
            async findUnique({ where }) {
                return dishes.find(dish => dish.id === where.id) ?? null;
            },
            async update({ where, data }) {
                const dish = dishes.find(item => item.id === where.id);
                Object.assign(dish, data);
                return dish;
            },
            async delete({ where }) {
                const index = dishes.findIndex(dish => dish.id === where.id);
                return dishes.splice(index, 1)[0];
            }
        },
        activity: {
            async create({ data }) {
                const activity = { id: activities.length + 1, ...data };
                activities.push(activity);
                return activity;
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

function token(userId = 1) {
    return jwt.sign({ sub: userId, email: users[0].email }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

function imageForm(type = "image/png") {
    const form = new FormData();
    form.append("image", new Blob([new Uint8Array([137, 80, 78, 71])], { type }), "image.png");
    return form;
}

async function request(path, { method = "GET", authorization, body } = {}) {
    const headers = {};
    if (authorization) headers.Authorization = authorization;
    if (typeof body === "string") headers["Content-Type"] = "application/json";
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
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

test("oferece CRUD de pratos somente ao proprietário do restaurante", async () => {
    const authorization = `Bearer ${token()}`;
    const created = await request("/restaurants/1/dishes", {
        method: "POST",
        authorization,
        body: JSON.stringify({ name: "Lasanha", category: "Massas", description: "Molho artesanal", price: 35 })
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.category, "Massas");

    const found = await request(`/dishes/${created.body.id}`);
    assert.equal(found.status, 200);

    const updated = await request(`/dishes/${created.body.id}`, {
        method: "PUT",
        authorization,
        body: JSON.stringify({ name: "Lasanha especial", category: "Massas", description: "Molho artesanal", price: 39 })
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.name, "Lasanha especial");

    const forbidden = await request(`/dishes/${created.body.id}`, {
        method: "DELETE",
        authorization: `Bearer ${token(2)}`
    });
    assert.equal(forbidden.status, 403);

    const removed = await fetch(`${baseUrl}/dishes/${created.body.id}`, {
        method: "DELETE",
        headers: { Authorization: authorization }
    });
    assert.equal(removed.status, 204);
    assert.ok(activities.some(activity => activity.action === "DISH_CREATED"));
    assert.ok(activities.some(activity => activity.action === "DISH_DELETED"));
});
