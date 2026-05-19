requireAuth();

const session = getSession();
document.getElementById('nav-email').textContent = session.email;
document.getElementById('logout-btn').addEventListener('click', logout);

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

// ─── API CALLS ───
async function fetchGoals() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/api/goals`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return await res.json();
    } catch (err) {
        console.error('Failed to fetch goals:', err);
        return null;
    }
}

async function fetchTodayLog() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/api/foodlog/${today}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return await res.json();
    } catch (err) {
        console.error('Failed to fetch log:', err);
        return [];
    }
}

async function saveGoals(goals) {
    try {
        const res = await fetch(`${CONFIG.API_URL}/api/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(goals)
        });
        return await res.json();
    } catch (err) {
        console.error('Failed to save goals:', err);
        return null;
    }
}

// ─── RENDER ───
function loadGoalsIntoForm(goals) {
    if (!goals) return;
    document.getElementById('goal-calories').value = goals.calories || '';
    document.getElementById('goal-protein').value = goals.protein || '';
    document.getElementById('goal-carbs').value = goals.carbs || '';
    document.getElementById('goal-fat').value = goals.fat || '';
}

function renderProgress(goals, log) {
    const noGoalsMsg = document.getElementById('no-goals-msg');

    if (!goals) {
        noGoalsMsg.classList.remove('hidden');
        return;
    }

    noGoalsMsg.classList.add('hidden');

    const totals = (log || []).reduce((acc, item) => {
        acc.calories += item.calories || 0;
        acc.protein += item.protein || 0;
        acc.carbs += item.carbs || 0;
        acc.fat += item.fat || 0;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const nutrients = [
        { key: 'calories', label: 'kcal' },
        { key: 'protein', label: 'g' },
        { key: 'carbs', label: 'g' },
        { key: 'fat', label: 'g' }
    ];

    nutrients.forEach(({ key, label }) => {
        const current = Math.round(totals[key]);
        const goal = goals[key] || 0;
        const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
        const over = goal > 0 && current > goal;

        document.getElementById(`progress-${key}-text`).textContent = `${current} / ${goal} ${label}`;
        const bar = document.getElementById(`progress-${key}-bar`);
        bar.style.width = pct + '%';
        bar.style.backgroundColor = over ? '#e74c3c' : '';
    });
}

// ─── SAVE BUTTON ───
document.getElementById('save-goals-btn').addEventListener('click', async () => {
    const goals = {
        calories: parseFloat(document.getElementById('goal-calories').value) || 0,
        protein: parseFloat(document.getElementById('goal-protein').value) || 0,
        carbs: parseFloat(document.getElementById('goal-carbs').value) || 0,
        fat: parseFloat(document.getElementById('goal-fat').value) || 0
    };

    const saved = await saveGoals(goals);

    const success = document.getElementById('goals-success');
    success.classList.remove('hidden');
    setTimeout(() => success.classList.add('hidden'), 3000);

    const log = await fetchTodayLog();
    renderProgress(saved, log);
});

// ─── INIT ───
async function init() {
    const [goals, log] = await Promise.all([fetchGoals(), fetchTodayLog()]);
    loadGoalsIntoForm(goals);
    renderProgress(goals, log);
}

init();