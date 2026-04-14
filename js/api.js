const API_KEY = CONFIG.SPOONACULAR_KEY;
const BASE_URL = 'https://api.spoonacular.com';

async function searchRecipes(query = 'healthy', number = 12) {
    const url = `${BASE_URL}/recipes/complexSearch?apiKey=${API_KEY}&query=${query}&number=${number}&addRecipeNutrition=true&fillIngredients=true`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

async function getRecipeById(id) {
    const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=true`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}