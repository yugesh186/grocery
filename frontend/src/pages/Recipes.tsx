import React, { useEffect, useState } from 'react';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { Sparkles, Clock, ListChecks, ArrowRight, ShoppingCart } from 'lucide-react';

interface RecipeType {
  id: number;
  title: string;
  description: string;
  ingredients: { name: string; qty: string }[];
  instructions: string[];
  image_url?: string;
  prep_time: string;
}

const Recipes: React.FC = () => {
  const { addToCart, showToast } = useApp();
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ai/meal-planner`)
      .then(res => res.json())
      .then(data => {
        setRecipes(data);
        if (data.length > 0) setSelectedRecipe(data[0]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleAddAllToCart = async (recipe: RecipeType) => {
    // Look up products in local catalog matching ingredients and add them
    try {
      showToast(`AI is matching ingredients for "${recipe.title}"...`, "info");
      
      // Fetch all products to find matching IDs
      const prodRes = await fetch(`${API_BASE_URL}/products?limit=1000`);
      if (!prodRes.ok) throw new Error("Catalog fetch failed");
      const prodData = await prodRes.json();
      const allProducts = prodData.products;

      let addedCount = 0;
      for (const ing of recipe.ingredients) {
        // Find best match in catalog
        const match = allProducts.find((p: any) => 
          p.name.toLowerCase().includes(ing.name.toLowerCase()) ||
          ing.name.toLowerCase().includes(p.name.toLowerCase())
        );

        if (match) {
          await addToCart(match.id, 1);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        showToast(`Added ${addedCount} ingredients for "${recipe.title}" to cart!`, "success");
      } else {
        showToast("No exact ingredients matched in catalog.", "error");
      }
    } catch {
      showToast("Error adding recipe ingredients.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary-dark border border-primary/20 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" /> AI Kitchen
        </span>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          AI Meal Planner & Recipe Generator
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Select a healthy chef-curated recipe and let our smart matching assistant add all required organic ingredients directly into your shopping cart in one click.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400 mt-4 font-semibold">Generating AI suggestions...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recipes List Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm tracking-wide uppercase px-1">Suggested Meals</h3>
            {recipes.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRecipe(r)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedRecipe?.id === r.id
                    ? 'border-primary bg-primary-light/30 dark:bg-primary/10 text-primary-dark dark:text-primary shadow-sm'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex gap-3">
                  <img src={r.image_url} alt={r.title} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm leading-tight text-gray-950 dark:text-white line-clamp-1 mb-1">{r.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{r.description}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {r.prep_time}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Recipe Detail Card */}
          {selectedRecipe && (
            <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-premium space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white mb-2">{selectedRecipe.title}</h2>
                  <p className="text-sm text-gray-400 leading-relaxed">{selectedRecipe.description}</p>
                </div>
                <button
                  onClick={() => handleAddAllToCart(selectedRecipe)}
                  className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-sm shadow-premium hover:shadow-premium-hover shrink-0 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" /> Add All to Cart
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Ingredients */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-base">
                    <ListChecks className="w-5 h-5 text-primary" /> Ingredients Needed
                  </h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-850 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span>{ing.name}</span>
                        <span className="text-primary">{ing.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-base">
                    <ArrowRight className="w-5 h-5 text-accent" /> Cooking Steps
                  </h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Recipes;
