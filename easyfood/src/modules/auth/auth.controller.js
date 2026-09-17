const authService = require("./auth.service");

function requiredString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

async function register(req, res) {
    const { name, email, password } = req.body ?? {};
    if (![name, email, password].every(requiredString)) {
        return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    }
    if (name.trim().length > 150 || email.trim().length > 150) {
        return res.status(400).json({ error: "Nome e e-mail devem ter no máximo 150 caracteres" });
    }
    // bcrypt considera somente os primeiros 72 bytes da senha.
    if (Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({ error: "A senha deve ter no máximo 72 bytes" });
    }

    try {
        const user = await authService.register({ name: name.trim(), email: email.trim(), password });
        return res.status(201).json(user);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: "E-mail já cadastrado" });
        }
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
}

async function login(req, res) {
    const { email, password } = req.body ?? {};
    if (![email, password].every(requiredString)) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }
    if (Buffer.byteLength(password, "utf8") > 72) {
        return res.status(401).json({ error: "Credenciais inválidas" });
    }

    try {
        const result = await authService.login({ email: email.trim(), password });
        if (!result) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
}

module.exports = { register, login };
