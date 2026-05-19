const API_URL = CONFIG.API_URL;

async function register(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.message };
        }

        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('email', data.email);
        return { success: true };

    } catch (err) {
        return { success: false, message: 'Could not connect to server.' };
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.message };
        }

        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('email', data.email);
        return { success: true };

    } catch (err) {
        return { success: false, message: 'Could not connect to server.' };
    }
}

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    window.location.href = '/pages/login.html';
}

function getSession() {
    const token = sessionStorage.getItem('token');
    const email = sessionStorage.getItem('email');
    if (!token || !email) return null;
    return { token, email };
}

function getToken() {
    return sessionStorage.getItem('token');
}

function requireAuth() {
    if (!getSession()) {
        window.location.href = '/pages/login.html';
    }
}