// Ingredient autocomplete using Open Food Facts API
// Free and open-source alternative to Target API

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/cgi/search.pl';

export interface IngredientSuggestion {
  name: string;
  image?: string;
  category?: string;
  brand?: string;
}

export const searchIngredients = async (query: string): Promise<IngredientSuggestion[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${OPEN_FOOD_FACTS_API}?search_terms=${encodeURIComponent(query)}&page_size=20&json=true`
    );
    const data = await response.json();
    
    if (data.products && Array.isArray(data.products)) {
      return data.products
        .filter((p: any) => p.product_name || p.generic_name)
        .slice(0, 10)
        .map((product: any) => ({
          name: product.product_name || product.generic_name || query,
          image: product.image_url || product.image_small_url,
          category: product.categories_tags?.[0]?.replace('en:', ''),
          brand: product.brands,
        }));
    }
    return [];
  } catch (error) {
    console.error('Error searching ingredients:', error);
    // Fallback: return simple suggestions
    return [
      { name: query, category: 'ingredient' },
    ];
  }
};

// Alternative: Spoonacular API (requires API key)
export const searchIngredientsSpoonacular = async (
  query: string,
  apiKey?: string
): Promise<IngredientSuggestion[]> => {
  if (!query || query.length < 2 || !apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(query)}&number=10&apiKey=${apiKey}`
    );
    const data = await response.json();
    
    return data.map((item: any) => ({
      name: item.name,
      image: item.image,
    }));
  } catch (error) {
    console.error('Error searching with Spoonacular:', error);
    return [];
  }
};

