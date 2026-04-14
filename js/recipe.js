requireAuth();

const session = getSession();
document.getElementById('nav-email').textContent = session.email;
document.getElementById('logout-btn').addEventListener('click', logout);

const loading = document.getElementById('loading');
const error = document.getElementById('error');
const detail = document.getElementById('recipe-detail');

function getNutrient(nutrients, name) {
    const nutrient = nutrients.find(n => n.name === name);
    return nutrient ? Math.round(nutrient.amount) + nutrient.unit : 'N/A';
}

async function loadRecipe() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = '/pages/browse.html';
        return;
    }

    try {
        const recipe = await getRecipeById(id);
        const nutrients = recipe.nutrition?.nutrients || [];

        document.getElementById('recipe-img').src = recipe.image;
        document.getElementById('recipe-img').alt = recipe.title;
        document.getElementById('recipe-title').textContent = recipe.title;

        document.getElementById('stat-calories').textContent = getNutrient(nutrients, 'Calories');
        document.getElementById('stat-protein').textContent = getNutrient(nutrients, 'Protein');
        document.getElementById('stat-carbs').textContent = getNutrient(nutrients, 'Carbohydrates');
        document.getElementById('stat-fat').textContent = getNutrient(nutrients, 'Fat');

        const tagContainer = document.getElementById('recipe-tags');
        if (recipe.vegetarian) tagContainer.innerHTML += `<span class="tag">Vegetarian</span>`;
        if (recipe.vegan) tagContainer.innerHTML += `<span class="tag">Vegan</span>`;
        if (recipe.glutenFree) tagContainer.innerHTML += `<span class="tag">Gluten Free</span>`;
        if (recipe.dairyFree) tagContainer.innerHTML += `<span class="tag">Dairy Free</span>`;

        const ingredientsList = document.getElementById('ingredients-list');
        recipe.extendedIngredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing.original;
            ingredientsList.appendChild(li);
        });

        const instructionsList = document.getElementById('instructions-list');
        const steps = recipe.analyzedInstructions?.[0]?.steps || [];
        if (steps.length > 0) {
            steps.forEach(step => {
                const li = document.createElement('li');
                li.textContent = step.step;
                instructionsList.appendChild(li);
            });
        } else {
            instructionsList.innerHTML = '<li>No instructions available for this recipe.</li>';
        }

        loading.classList.add('hidden');
        detail.classList.remove('hidden');

    } catch (err) {
        loading.classList.add('hidden');
        error.textContent = 'Failed to load recipe. Please go back and try again.';
        error.classList.remove('hidden');
    }
}

loadRecipe();