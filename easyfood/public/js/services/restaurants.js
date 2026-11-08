import { request, upload } from './api.js';
export const listRestaurants = () => request('/restaurants');
export const createRestaurant = (body) => request('/restaurants', { method: 'POST', body, authenticated: true });
export const listDishes = (restaurantId) => request(`/restaurants/${restaurantId}/dishes`);
export const createDish = (restaurantId, body) => request(`/restaurants/${restaurantId}/dishes`, { method: 'POST', body, authenticated: true });
export const uploadDishImage = (dishId, file) => upload(`/dishes/${dishId}/image`, file, { authenticated: true });
