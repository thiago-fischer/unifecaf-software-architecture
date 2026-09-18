import { listRestaurants, createRestaurant } from '../services/restaurants.js';
import { getSession, clearSession, validateSession } from '../services/auth.js';
import { restaurantCard } from '../components/restaurant-card.js';
const $ = (selector) => document.querySelector(selector);
const dialog = $('#restaurant-dialog');
const form = $('#restaurant-form');
let restaurants = [];
let listReady = false;
let saving = false;
let toastTimeout;
function toast(message) {
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { $('#toast').hidden = true; }, 6000);
}
function renderSession() {
    const container = $('#session');
    container.replaceChildren();
    const session = getSession();
    if (session?.token) {
        const name = document.createElement('span');
        name.className = 'session-name';
        name.textContent = `Olá, ${session.user?.name || 'visitante'}`;
        const logout = document.createElement('button');
        logout.className = 'text-button';
        logout.textContent = 'Sair';
        logout.onclick = () => { clearSession(); renderSession(); toast('Você saiu da sua conta.'); };
        container.append(name, logout);
    } else {
        const link = document.createElement('a');
        link.href = '/login.html';
        link.className = 'button secondary small';
        link.textContent = 'Entrar / Criar conta ↗';
        container.append(link);
    }
}
const normalize = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
function renderList() {
    if (!listReady) return;
    const query = normalize($('#search').value.trim());
    const category = $('#category').value;
    const filtered = restaurants.filter(item => normalize(item.name).includes(query) && (!category || item.category === category));
    filtered.sort($('#sort').value === 'rating' ? (a, b) => Number(b.rating || 0) - Number(a.rating || 0) : (a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    $('#restaurants').replaceChildren(...filtered.map(restaurantCard));
    $('#result-count').textContent = `${filtered.length} restaurante${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`;
    $('#clear-filters').hidden = !query && !category && $('#sort').value === 'name';
    $('#list-state').hidden = filtered.length > 0;
    $('#list-state').textContent = restaurants.length ? 'Nenhum restaurante encontrado. Experimente outra busca ou categoria.' : 'A primeira descoberta pode ser sua. Adicione um restaurante para começar!';
}
function updateCategories() {
    const current = $('#category').value;
    $('#category').replaceChildren(new Option('Todas as categorias', ''));
    $('#category-suggestions').replaceChildren();
    [...new Set(restaurants.map(item => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach(category => {
        $('#category').add(new Option(category, category));
        $('#category-suggestions').append(new Option(category, category));
    });
    $('#category').value = current;
}
async function load() {
    listReady = false;
    $('#retry').hidden = true;
    $('#list-state').hidden = false;
    $('#list-state').textContent = 'Carregando restaurantes…';
    $('#restaurants').setAttribute('aria-busy', 'true');
    try { restaurants = await listRestaurants(); listReady = true; updateCategories(); renderList(); }
    catch (error) { $('#list-state').textContent = error.message; $('#result-count').textContent = 'A lista não está disponível'; $('#retry').hidden = false; }
    finally { $('#restaurants').setAttribute('aria-busy', 'false'); }
}
function openCreate() {
    if (!getSession()?.token) { location.href = '/login.html?next=create'; return; }
    $('#form-error').hidden = true;
    dialog.showModal();
}
$('#new-restaurant').onclick = openCreate;
$('#close-dialog').onclick = () => { if (!saving) dialog.close(); };
dialog.addEventListener('cancel', event => { if (saving) event.preventDefault(); });
$('#retry').onclick = load;
$('#search').addEventListener('input', renderList);
$('#category').addEventListener('change', renderList);
$('#sort').addEventListener('change', renderList);
$('#clear-filters').onclick = () => { $('#search').value = ''; $('#category').value = ''; $('#sort').value = 'name'; renderList(); };
window.addEventListener('session-expired', () => { renderSession(); });
form.addEventListener('submit', async event => {
    event.preventDefault();
    if (saving) return;
    const name = form.elements.name.value.trim();
    const category = form.elements.category.value.trim();
    if (!name || !category) { $('#form-error').textContent = 'Preencha o nome e a categoria.'; $('#form-error').hidden = false; return; }
    const body = { name, category };
    if (form.elements.rating.value !== '') body.rating = Number(form.elements.rating.value);
    saving = true;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    $('#close-dialog').disabled = true;
    submit.textContent = 'Cadastrando…';
    $('#form-error').hidden = true;
    try {
        const created = await createRestaurant(body);
        restaurants.push(created);
        listReady = true;
        $('#search').value = '';
        $('#category').value = '';
        updateCategories(); renderList();
        $('#retry').hidden = true;
        dialog.close(); form.reset(); toast('Restaurante cadastrado. Boa descoberta!');
    } catch (error) {
        if (error.status === 401) { location.href = '/login.html?reason=expired&next=create'; return; }
        $('#form-error').textContent = error.message;
        $('#form-error').hidden = false;
    } finally { saving = false; submit.disabled = false; $('#close-dialog').disabled = false; submit.textContent = 'Cadastrar restaurante'; }
});
renderSession();
load();
if (getSession()?.token) {
    try {
        await validateSession();
        if (new URLSearchParams(location.search).get('create') === '1') { openCreate(); history.replaceState(null, '', '/'); }
    } catch (error) { toast(error.message); }
}
