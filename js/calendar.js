requireAuth();

const session = getSession();
document.getElementById('nav-email').textContent = session.email;
document.getElementById('logout-btn').addEventListener('click', logout);

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
const now = new Date();
const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

let loggedDates = [];

// ─── API CALLS ───
async function fetchLoggedDates() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/api/foodlog`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return await res.json();
    } catch (err) {
        console.error('Failed to fetch logged dates:', err);
        return [];
    }
}

async function fetchLogForDate(dateStr) {
    try {
        const res = await fetch(`${CONFIG.API_URL}/api/foodlog/${dateStr}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return await res.json();
    } catch (err) {
        console.error('Failed to fetch log:', err);
        return [];
    }
}

// ─── RENDER CALENDAR ───
function renderCalendar() {
    const title = document.getElementById('calendar-title');
    const daysContainer = document.getElementById('calendar-days');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    title.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    daysContainer.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        daysContainer.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const mm = String(currentMonth + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateStr = `${currentYear}-${mm}-${dd}`;
        const hasLog = loggedDates.includes(dateStr);
        const isToday = dateStr === todayStr;

        const cell = document.createElement('div');
        cell.className = 'cal-day';
        if (isToday) cell.classList.add('today');
        if (hasLog) cell.classList.add('has-log');

        cell.innerHTML = `
            <span class="cal-day-number">${day}</span>
            ${hasLog ? '<span class="cal-dot"></span>' : ''}
        `;

        cell.addEventListener('click', () => showDayDetail(dateStr, day, cell));
        daysContainer.appendChild(cell);
    }
}

// ─── DAY DETAIL ───
async function showDayDetail(dateStr, day, cellEl) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    document.getElementById('detail-title').textContent =
        `${monthNames[currentMonth]} ${day}, ${currentYear}`;

    document.getElementById('detail-empty').classList.add('hidden');
    document.getElementById('detail-content').classList.add('hidden');
    document.getElementById('detail-no-log').classList.add('hidden');

    document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
    cellEl.classList.add('selected');

    const log = await fetchLogForDate(dateStr);

    if (!log || log.length === 0) {
        document.getElementById('detail-no-log').classList.remove('hidden');
        return;
    }

    const totals = log.reduce((acc, item) => {
        acc.calories += item.calories || 0;
        acc.protein += item.protein || 0;
        acc.carbs += item.carbs || 0;
        acc.fat += item.fat || 0;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    document.getElementById('detail-totals').innerHTML = `
        <div class="total-item">
            <span class="total-value">${Math.round(totals.calories)}</span>
            <span class="total-label">Calories</span>
        </div>
        <div class="total-item">
            <span class="total-value">${Math.round(totals.protein)}g</span>
            <span class="total-label">Protein</span>
        </div>
        <div class="total-item">
            <span class="total-value">${Math.round(totals.carbs)}g</span>
            <span class="total-label">Carbs</span>
        </div>
        <div class="total-item">
            <span class="total-value">${Math.round(totals.fat)}g</span>
            <span class="total-label">Fat</span>
        </div>
    `;

    const list = document.getElementById('detail-list');
    list.innerHTML = '';
    log.forEach(item => {
        const li = document.createElement('li');
        li.className = 'log-item';
        li.innerHTML = `
            <div class="log-item-info">
                <span class="log-item-name">${item.name}</span>
                <span class="log-item-macros">${Math.round(item.calories)} kcal &nbsp;|&nbsp; P: ${Math.round(item.protein)}g &nbsp;|&nbsp; C: ${Math.round(item.carbs)}g &nbsp;|&nbsp; F: ${Math.round(item.fat)}g</span>
            </div>
        `;
        list.appendChild(li);
    });

    document.getElementById('detail-content').classList.remove('hidden');
}

// ─── NAV BUTTONS ───
document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
});

// ─── INIT ───
async function init() {
    loggedDates = await fetchLoggedDates();
    renderCalendar();
}

init();