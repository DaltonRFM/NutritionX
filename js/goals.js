requireAuth();

const session = getSession();
document.getElementById('nav-email').textContent = session.email;
document.getElementById('logout-btn').addEventListener('click', logout);

const GOALS_KEY = 'goals_' + session.email;
const now = new Date();
const LOG_KEY = 'log_' + `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

function getGoals() {
    return JSON.parse(localStorage.getItem(GOALS_KEY)) || null;
}

function getTodayLog() {
    return JSON.parse(localStorage.getItem(LOG_KEY)) || [];
}

function getTodayTotals() {
    const log = getTodayLog();
    return log.reduce((totals, item) => {
        totals.calories += item.calories || 0;
        totals.protein += item.protein || 0;
        totals.carbs += item.carbs || 0;
        totals.fat += item.fat || 0;
        return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function loadGoalsIntoForm() {
    const goals = getGoals();
    if (!goals) return;
    document.getElementById('goal-calories').value = goals.calories || '';
    document.getElementById('goal-protein').value = goals.protein || '';
    document.getElementById('goal-carbs').value = goals.carbs || '';
    document.getElementById('goal-fat').value = goals.fat || '';
}

function renderProgress() {
    const goals = getGoals();
    const noGoalsMsg = document.getElementById('no-goals-msg');

    if (!goals) {
        noGoalsMsg.classList.remove('hidden');
        return;
    }

    noGoalsMsg.classList.add('hidden');
    const totals = getTodayTotals();

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

document.getElementById('save-goals-btn').addEventListener('click', () => {
    const goals = {
        calories: parseFloat(document.getElementById('goal-calories').value) || 0,
        protein: parseFloat(document.getElementById('goal-protein').value) || 0,
        carbs: parseFloat(document.getElementById('goal-carbs').value) || 0,
        fat: parseFloat(document.getElementById('goal-fat').value) || 0
    };

    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));

    const success = document.getElementById('goals-success');
    success.classList.remove('hidden');
    setTimeout(() => success.classList.add('hidden'), 3000);

    renderProgress();
});

loadGoalsIntoForm();
renderProgress();