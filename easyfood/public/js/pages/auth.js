import { login, register } from '../services/auth.js';
const form = document.querySelector('#auth-form');
const submit = document.querySelector('#submit-auth');
const error = document.querySelector('#auth-error');
const notice = document.querySelector('#auth-notice');
let mode = 'login';
let busy = false;
function setMode(next) {
    if (busy) return;
    mode = next;
    const registering = mode === 'register';
    document.querySelector('#name-field').hidden = !registering;
    form.elements.name.disabled = !registering;
    form.elements.name.required = registering;
    form.elements.password.autocomplete = registering ? 'new-password' : 'current-password';
    document.querySelector('#auth-title').textContent = registering ? 'Sua mesa está reservada.' : 'Bom te ver por aqui.';
    document.querySelector('#auth-description').textContent = registering ? 'Crie sua conta e compartilhe novas descobertas.' : 'Entre para compartilhar seus restaurantes favoritos.';
    submit.textContent = registering ? 'Criar minha conta ↗' : 'Entrar na minha conta ↗';
    for (const tab of ['login', 'register']) {
        document.querySelector(`#${tab}-tab`).classList.toggle('selected', mode === tab);
        document.querySelector(`#${tab}-tab`).setAttribute('aria-pressed', String(mode === tab));
    }
    error.hidden = true;
    notice.hidden = true;
}
document.querySelector('#login-tab').onclick = () => setMode('login');
document.querySelector('#register-tab').onclick = () => setMode('register');
document.querySelector('#toggle-password').onclick = (event) => {
    const show = form.elements.password.type === 'password';
    form.elements.password.type = show ? 'text' : 'password';
    event.currentTarget.textContent = show ? 'Ocultar' : 'Mostrar';
    event.currentTarget.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
    event.currentTarget.setAttribute('aria-pressed', String(show));
};
if (new URLSearchParams(location.search).get('reason') === 'expired') {
    notice.textContent = 'Sua sessão expirou. Entre novamente para continuar.';
    notice.hidden = false;
}
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    error.hidden = true;
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const name = form.elements.name.value.trim();
    if ((mode === 'register' && !name) || !password.trim() || new TextEncoder().encode(password).length > 72) {
        error.textContent = 'Preencha os campos sem usar apenas espaços. A senha deve ter no máximo 72 bytes.';
        error.hidden = false;
        return;
    }
    busy = true;
    submit.disabled = true;
    submit.textContent = 'Aguarde…';
    try {
        if (mode === 'register') {
            await register(name, email, password);
            busy = false;
            setMode('login');
            notice.textContent = 'Conta criada! Entre com seu e-mail e senha.';
            notice.hidden = false;
            form.elements.password.value = '';
            form.elements.password.focus();
        } else {
            await login(email, password);
            location.href = new URLSearchParams(location.search).get('next') === 'create' ? '/?create=1' : '/';
        }
    } catch (failure) {
        error.textContent = failure.message;
        error.hidden = false;
    } finally {
        busy = false;
        submit.disabled = false;
        submit.textContent = mode === 'register' ? 'Criar minha conta ↗' : 'Entrar na minha conta ↗';
    }
});
