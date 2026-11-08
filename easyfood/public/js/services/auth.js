import { request, upload, saveSession, clearSession, getSession } from './api.js';
export { clearSession, getSession, saveSession };
export async function login(email, password) {
    const session = await request('/auth/login', { method: 'POST', body: { email, password } });
    saveSession(session);
    return session;
}
export function register(name, email, password) { return request('/auth/register', { method: 'POST', body: { name, email, password } }); }
export function validateSession() { return request('/auth/me', { authenticated: true }); }
export function uploadProfileImage(file) { return upload('/auth/me/image', file, { authenticated: true }); }
