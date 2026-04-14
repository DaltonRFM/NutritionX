requireAuth();

const session = getSession();
document.getElementById('nav-email').textContent = session.email;
document.getElementById('logout-btn').addEventListener('click', logout);

const grid = document.getElementById('recipe-grid');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

async function loadRecipes(query = 'healthy') {
    grid.innerHTML = '';
    error.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const recipes = await searchRecipes(query);

        if (!recipes || recipes.length === 0) {
            error.textContent = 'No recipes found. Try a different search.';
            error.classList.remove('hidden');
            return;
        }

        recipes.forEach(recipe => renderCard(recipe));
    } catch (err) {
        error.textContent = 'Failed to load recipes. Check your API key or try again.';
        error.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

function renderCard(recipe) {
    const calories = recipe.nutrition?.nutrients?.find(n => n.name === 'Calories');
    const ingredients = recipe.missedIngredients || recipe.extendedIngredients || [];
    const topIngredients = ingredients.slice(0, 3).map(i => i.name).join(', ');

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" class="card-img" />
        <div class="card-body">
            <h3 class="card-title">${recipe.title}</h3>
            <p class="card-calories">${calories ? Math.round(calories.amount) + ' kcal' : 'N/A'}</p>
            <p class="card-ingredients"><span>Ingredients:</span> ${topIngredients || 'N/A'}</p>
            <button class="btn-details" onclick="window.location.href='/pages/recipe.html?id=${recipe.id}'">
                View Details
            </button>
        </div>
    `;

    grid.appendChild(card);
}

document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.trim();
    if (query) loadRecipes(query);
});

document.getElementById('search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const query = document.getElementById('search-input').value.trim();
        if (query) loadRecipes(query);
    }
});

loadRecipes();