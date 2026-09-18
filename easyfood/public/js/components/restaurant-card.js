export function restaurantCard(restaurant) {
    const card = document.createElement('article');
    card.className = 'restaurant-card';
    const art = document.createElement('div');
    const name = String(restaurant.name || 'Restaurante');
    const hue = [...String(restaurant.category || name)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
    art.className = `card-art palette-${hue}`;
    art.setAttribute('aria-hidden', 'true');
    const monogram = document.createElement('span');
    monogram.textContent = name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => [...word][0]).join('').toLocaleUpperCase('pt-BR');
    art.append(monogram);
    const content = document.createElement('div');
    content.className = 'card-content';
    const category = document.createElement('span');
    category.className = 'category-tag';
    category.textContent = restaurant.category || 'Sem categoria';
    const title = document.createElement('h3');
    title.textContent = name;
    const rating = document.createElement('p');
    rating.className = 'card-rating';
    rating.textContent = `★ ${Number(restaurant.rating || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5`;
    const note = document.createElement('span');
    note.textContent = 'Nota informada no cadastro';
    rating.append(note);
    content.append(category, title, rating);
    card.append(art, content);
    return card;
}
