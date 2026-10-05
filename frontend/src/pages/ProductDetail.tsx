import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp, API_BASE_URL, ProductType } from '../context/AppContext';
import { Leaf, ShieldAlert, Sparkles, Heart, ShoppingBag, Plus, Minus, ArrowLeft } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { cart, wishlist, addToCart, updateCartQty, toggleWishlist } = useApp();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [healthyAlts, setHealthyAlts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const cartItem = cart.find(item => item.product.id === Number(id));
  const isWishlisted = wishlist.includes(Number(id));

  useEffect(() => {
    setLoading(true);
    // Fetch product
    fetch(`${API_BASE_URL}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        // Fetch healthy alternatives
        return fetch(`${API_BASE_URL}/ai/healthy-alternatives/${id}`);
      })
      .then(res => res.json())
      .then(data => {
        setHealthyAlts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <span className="text-xs text-gray-400 mt-4 font-semibold block">Analyzing product data...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Product Not Found</h2>
        <Link to="/products" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const discountPercent = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-16">
      
      {/* Back button */}
      <div>
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4.5 h-4.5" /> Back to Products Catalog
        </Link>
      </div>

      {/* Main product configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Left: Product Image */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 relative overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-96 object-cover rounded-2xl"
          />
          {discountPercent > 0 && (
            <span className="absolute top-8 left-8 px-3 py-1 bg-accent text-white font-extrabold text-sm rounded-lg shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Right: Info details */}
        <div className="space-y-6 text-left">
          
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              {product.is_organic && (
                <span className="inline-flex items-center gap-0.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Leaf className="w-3.5 h-3.5 fill-current" /> Organic Certified
                </span>
              )}
              <span className="text-xs text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                Shelf life: {product.shelf_life || 'N/A'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white leading-tight">
              {product.name}
            </h1>
            <span className="text-sm text-gray-400 font-semibold block">{product.weight}</span>
          </div>

          <div className="flex items-baseline gap-3 border-y border-gray-100 dark:border-gray-800 py-4">
            <span className="text-3xl font-black text-gray-900 dark:text-white">₹{product.price.toFixed(2)}</span>
            {product.mrp > product.price && (
              <span className="text-lg text-gray-455 line-through">₹{product.mrp.toFixed(2)}</span>
            )}
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

          {/* Add actions */}
          <div className="flex gap-4 items-center">
            {cartItem ? (
              <div className="flex items-center gap-4 bg-primary-light/50 border border-primary/20 rounded-2xl p-1.5 max-w-[160px] w-full justify-between">
                <button
                  onClick={() => updateCartQty(cartItem.id, cartItem.quantity - 1)}
                  className="p-2 rounded-xl bg-white text-primary shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-base text-primary-dark">{cartItem.quantity}</span>
                <button
                  onClick={() => updateCartQty(cartItem.id, cartItem.quantity + 1)}
                  className="p-2 rounded-xl bg-white text-primary shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product.id)}
                disabled={product.stock <= 0}
                className="flex-1 max-w-[240px] flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all shadow-premium"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>
            )}

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3.5 rounded-2xl border transition-all ${
                isWishlisted
                  ? 'bg-red-50 border-red-100 text-red-500'
                  : 'bg-white border-gray-200 text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Metadata info */}
          <div className="grid grid-cols-2 gap-4 text-xs font-bold pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-gray-400 block mb-0.5">Origin Country</span>
              <span className="text-gray-700 dark:text-gray-200">{product.origin || 'USA'}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Ingredients</span>
              <span className="text-gray-700 dark:text-gray-200 truncate block max-w-[200px]" title={product.ingredients}>{product.ingredients || 'Natural Crops'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Nutrition details & AI Health swap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Nutrition values Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm text-left">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-lg mb-4">Nutritional Facts</h3>
          {product.nutrition ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(product.nutrition).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl">
                  <span className="text-xs text-gray-400 font-bold block mb-0.5">{key}</span>
                  <span className="text-sm font-extrabold text-gray-800 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Nutritional values are natural and chemical-free.</p>
          )}
        </div>

        {/* AI Swap recommendations */}
        {healthyAlts.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-gray-900 dark:to-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 text-left space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" /> AI Healthy Swaps
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We found organic and premium nutrient-rich alternatives matching this category:
            </p>
            <div className="space-y-3">
              {healthyAlts.map(alt => (
                <Link
                  key={alt.id}
                  to={`/products/${alt.id}`}
                  className="flex items-center gap-3 p-2 bg-white dark:bg-gray-950 rounded-xl hover:shadow transition-shadow border border-gray-100 dark:border-gray-850 block"
                >
                  <img src={alt.image_url} alt={alt.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 dark:text-white line-clamp-1 leading-snug">{alt.name}</h4>
                    <span className="text-xs text-primary font-extrabold">₹{alt.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default ProductDetail;
