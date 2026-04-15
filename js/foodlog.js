requireAuth();

const session = getSession();
document.getElementById('nav-email').textContent = session.email;
document.getElementById('logout-btn').addEventListener('click', logout);

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const LOG_KEY = 'log_' + today;
document.getElementById('log-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ─── LOG STORAGE ───
function getLog() {
    return JSON.parse(localStorage.getItem(LOG_KEY)) || [];
}

function saveLog(log) {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

function addToLog(item) {
    const log = getLog();
    log.push(item);
    saveLog(log);
    renderLog();
}

function removeFromLog(index) {
    const log = getLog();
    log.splice(index, 1);
    saveLog(log);
    renderLog();
}

// ─── RENDER LOG ───
function renderLog() {
    const log = getLog();
    const list = document.getElementById('log-list');
    const empty = document.getElementById('log-empty');
    list.innerHTML = '';

    if (log.length === 0) {
        empty.classList.remove('hidden');
        updateTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        return;
    }

    empty.classList.add('hidden');

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    log.forEach((item, index) => {
        totals.calories += item.calories || 0;
        totals.protein += item.protein || 0;
        totals.carbs += item.carbs || 0;
        totals.fat += item.fat || 0;

        const li = document.createElement('li');
        li.className = 'log-item';
        li.innerHTML = `
            <div class="log-item-info">
                <span class="log-item-name">${item.name}</span>
                <span class="log-item-macros">${Math.round(item.calories)} kcal &nbsp;|&nbsp; P: ${Math.round(item.protein)}g &nbsp;|&nbsp; C: ${Math.round(item.carbs)}g &nbsp;|&nbsp; F: ${Math.round(item.fat)}g</span>
            </div>
            <button class="btn-remove" onclick="removeFromLog(${index})">✕</button>
        `;
        list.appendChild(li);
    });

    updateTotals(totals);
}

function updateTotals(totals) {
    document.getElementById('total-calories').textContent = Math.round(totals.calories);
    document.getElementById('total-protein').textContent = Math.round(totals.protein) + 'g';
    document.getElementById('total-carbs').textContent = Math.round(totals.carbs) + 'g';
    document.getElementById('total-fat').textContent = Math.round(totals.fat) + 'g';
}

// ─── TABS ───
function switchTab(tab) {
    document.getElementById('panel-search').classList.toggle('hidden', tab !== 'search');
    document.getElementById('panel-manual').classList.toggle('hidden', tab !== 'manual');
    document.getElementById('tab-search').classList.toggle('active', tab === 'search');
    document.getElementById('tab-manual').classList.toggle('active', tab === 'manual');
}

// ─── SPOONACULAR SEARCH ───
document.getElementById('food-search-btn').addEventListener('click', searchFood);
document.getElementById('food-search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchFood();
});

async function searchFood() {
    const query = document.getElementById('food-search-input').value.trim();
    if (!query) return;

    const results = document.getElementById('food-search-results');
    results.innerHTML = '<p class="muted-text">Searching...</p>';

    try {
        const recipes = await searchRecipes(query, 5);
        results.innerHTML = '';

        if (!recipes || recipes.length === 0) {
            results.innerHTML = '<p class="muted-text">No results found.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const nutrients = recipe.nutrition?.nutrients || [];
            const calories = nutrients.find(n => n.name === 'Calories')?.amount || 0;
            const protein = nutrients.find(n => n.name === 'Protein')?.amount || 0;
            const carbs = nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0;
            const fat = nutrients.find(n => n.name === 'Fat')?.amount || 0;

            const div = document.createElement('div');
            div.className = 'food-result-item';
            div.innerHTML = `
                <div class="food-result-info">
                    <span class="food-result-name">${recipe.title}</span>
                    <span class="food-result-macros">${Math.round(calories)} kcal | P: ${Math.round(protein)}g | C: ${Math.round(carbs)}g | F: ${Math.round(fat)}g</span>
                </div>
                <button class="btn-add-food">+ Add</button>
            `;

            div.querySelector('.btn-add-food').addEventListener('click', () => {
                addToLog({ name: recipe.title, calories, protein, carbs, fat });
                results.innerHTML = '';
                document.getElementById('food-search-input').value = '';
            });

            results.appendChild(div);
        });
    } catch (err) {
        results.innerHTML = '<p class="muted-text">Failed to search. Try again.</p>';
    }
}

// ─── MANUAL ENTRY ───
document.getElementById('manual-add-btn').addEventListener('click', () => {
    const name = document.getElementById('manual-name').value.trim();
    const calories = parseFloat(document.getElementById('manual-calories').value) || 0;
    const protein = parseFloat(document.getElementById('manual-protein').value) || 0;
    const carbs = parseFloat(document.getElementById('manual-carbs').value) || 0;
    const fat = parseFloat(document.getElementById('manual-fat').value) || 0;
    const error = document.getElementById('manual-error');

    if (!name) {
        error.textContent = 'Please enter a food name.';
        error.classList.remove('hidden');
        return;
    }

    error.classList.add('hidden');
    addToLog({ name, calories, protein, carbs, fat });

    document.getElementById('manual-name').value = '';
    document.getElementById('manual-calories').value = '';
    document.getElementById('manual-protein').value = '';
    document.getElementById('manual-carbs').value = '';
    document.getElementById('manual-fat').value = '';
});

// ─── CLEAR LOG ───
document.getElementById('clear-log-btn').addEventListener('click', () => {
    if (confirm('Clear all food logged today?')) {
        saveLog([]);
        renderLog();
    }
});

renderLog();