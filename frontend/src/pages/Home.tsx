import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp, API_BASE_URL, ProductType } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Percent } from 'lucide-react';

const Home: React.FC = () => {
  const { categories } = useApp();
  const [popularProducts, setPopularProducts] = useState<ProductType[]>([]);
  const [organicProducts, setOrganicProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch popular products
    fetch(`${API_BASE_URL}/products?limit=8`)
      .then(res => res.json())
      .then(data => {
        setPopularProducts(data.products || []);
        setOrganicProducts((data.products || []).filter((p: ProductType) => p.is_organic));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-16 font-sans">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-primary-light/20 dark:from-gray-900 dark:via-gray-950 dark:to-emerald-950/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" /> AI-Assisted Grocery Shopping
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Sourced Organic. <br />
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Delivered Smarter.</span>
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
              FreshKart AI brings you fresh local organic greens, dairy, bakery items, and custom weekly meal planners driven by smart AI recommendations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-full font-bold text-sm shadow-premium hover:shadow-premium-hover transition-all flex items-center gap-1.5">
                Shop Groceries <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/recipes" className="px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-full font-bold text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5">
                AI Meal Planner <Sparkles className="w-4 h-4 text-accent" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
              alt="Fresh vegetables box"
              className="w-full h-[400px] object-cover rounded-3xl shadow-premium border border-white/50 dark:border-gray-800"
            />
            <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl glass-panel shadow-premium border border-white/40 max-w-[200px] text-left">
              <span className="text-xs text-gray-400 font-medium block">⚡ Fast Delivery</span>
              <span className="text-sm font-bold text-gray-800 dark:text-white">Fresh to your door in 2 Hours</span>
            </div>
          </div>

        </div>
      </section>

      {/* Services Strengths */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl shadow-sm hover-lift">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-primary rounded-xl shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Free & Fast Shipping</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Free delivery on orders above ₹35. Delivered fresh within 2 hours.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl shadow-sm hover-lift">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-primary rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">100% Quality Checked</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Rigorous grading to ensure only top organic crops and goods reach you.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl shadow-sm hover-lift">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-primary rounded-xl shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Zero Hassle Refund</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Not satisfied with freshness? Request instant refunds in one click.</p>
          </div>
        </div>
      </section>

      {/* Trending Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Shop by Category</h2>
            <p className="text-xs text-gray-400 mt-1">Explore our range of fresh groceries</p>
          </div>
          <Link to="/products" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat: any) => (
            <div key={cat.id}>
              <CategoryCard category={cat} />
            </div>
          ))}
        </div>
      </section>

      {/* Offer Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-accent to-red-500 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-premium relative overflow-hidden">
          <div className="space-y-2 text-left z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
              <Percent className="w-3.5 h-3.5" /> Flash Discount
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Save 20% on Weekly Staples</h2>
            <p className="text-sm text-red-50 leading-relaxed max-w-md">
              Apply coupon <span className="font-mono bg-white/20 px-2 py-0.5 rounded">FRESH20</span> at checkout to save on organic veggies, whole milk, and bread.
            </p>
          </div>
          <Link to="/products" className="px-6 py-3.5 bg-white text-accent hover:bg-red-50 rounded-full font-bold text-sm shadow transition-all shrink-0 z-10">
            Grab Discount Now
          </Link>
          {/* Decorative graphic background */}
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl select-none font-bold">SALE</div>
        </div>
      </section>

      {/* Popular Products Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Trending Grocery Items</h2>
            <p className="text-xs text-gray-400 mt-1">Our customer favorites this week</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-72 rounded-2xl skeleton-shimmer"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map(prod => (
              <div key={prod.id}>
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Organic Highlights Grid Section */}
      {organicProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                🥬 Organic Choices
              </h2>
              <p className="text-xs text-gray-400 mt-1">Grown without synthetic fertilizer or chemicals</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {organicProducts.map(prod => (
              <div key={prod.id}>
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
