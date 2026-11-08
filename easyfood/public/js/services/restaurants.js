import { request, upload } from './api.js';
export const listRestaurants = () => request('/restaurants');
export const createRestaurant = (body) => request('/restaurants', { method: 'POST', body, authenticated: true });
export const listDishes = (restaurantId) => request(`/restaurants/${restaurantId}/dishes`);
export const createDish = (restaurantId, body) => request(`/restaurants/${restaurantId}/dishes`, { method: 'POST', body: { category: 'Outros', ...body }, authenticated: true });
export const getDish = (dishId) => request(`/dishes/${dishId}`);
export const updateDish = (dishId, body) => request(`/dishes/${dishId}`, { method: 'PUT', body, authenticated: true });
export const deleteDish = (dishId) => request(`/dishes/${dishId}`, { method: 'DELETE', authenticated: true });
export const uploadDishImage = (dishId, file) => upload(`/dishes/${dishId}/image`, file, { authenticated: true });
