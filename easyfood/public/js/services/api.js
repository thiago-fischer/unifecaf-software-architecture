const SESSION_KEY = 'easyfood.session';

export function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
}

export function saveSession(session) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
export function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

export async function request(path, { method = 'GET', body, authenticated = false } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (authenticated && getSession()?.token) headers.Authorization = `Bearer ${getSession().token}`;
    let response;
    try {
        response = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    } catch {
        throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        if (authenticated && response.status === 401) {
            clearSession();
            window.dispatchEvent(new Event('session-expired'));
        }
        const error = new Error(authenticated && response.status === 401 ? 'Sua sessão expirou. Entre novamente para continuar.' : data?.error || 'Não foi possível concluir a operação.');
        error.status = response.status;
        throw error;
    }
    return data;
}
