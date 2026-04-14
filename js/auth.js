const AUTH_KEY = 'nutrition_user';

function register(email, password) {
    const existing = getUser(email);
    if (existing) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const user = { email, password };
    localStorage.setItem(AUTH_KEY + '_' + email, JSON.stringify(user));
    sessionStorage.setItem(AUTH_KEY + '_session', JSON.stringify(user));
    return { success: true };
}

function login(email, password) {
    const user = getUser(email);
    if (!user || user.password !== password) {
        return { success: false, message: 'Invalid email or password.' };
    }

    sessionStorage.setItem(AUTH_KEY + '_session', JSON.stringify(user));
    return { success: true };
}

function logout() {
    sessionStorage.removeItem(AUTH_KEY + '_session');
    window.location.href = '/pages/login.html';
}

function getSession() {
    return JSON.parse(sessionStorage.getItem(AUTH_KEY + '_session'));
}

function getUser(email) {
    return JSON.parse(localStorage.getItem(AUTH_KEY + '_' + email));
}

function requireAuth() {
    if (!getSession()) {
        window.location.href = '/pages/login.html';
    }
}
