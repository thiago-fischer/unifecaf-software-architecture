import { request } from './api.js';
export const listRestaurants = () => request('/restaurants');
export const createRestaurant = (body) => request('/restaurants', { method: 'POST', body, authenticated: true });
