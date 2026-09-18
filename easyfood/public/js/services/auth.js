import { request, saveSession, clearSession, getSession } from './api.js';
export { clearSession, getSession };
export async function login(email, password) {
    const session = await request('/auth/login', { method: 'POST', body: { email, password } });
    saveSession(session);
    return session;
}
export function register(name, email, password) { return request('/auth/register', { method: 'POST', body: { name, email, password } }); }
export function validateSession() { return request('/auth/me', { authenticated: true }); }
