import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Leaf, Plus, Minus, Eye, Star, CheckSquare, Square, X, ShieldAlert, Truck } from 'lucide-react';
import { useApp, ProductType } from '../context/AppContext';

interface ProductCardProps {
  product: ProductType;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, wishlist, addToCart, updateCartQty, toggleWishlist, showToast } = useApp();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const cartItem = cart.find(item => item.product.id === product.id);

  const discountPercent = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  // Deterministic Mock Brand, Rating, Reviews, Delivery Time
  const brandName = product.origin || 'FreshKart Select';
  const rating = Number(((product.id * 7) % 5 * 0.1 + 4.2).toFixed(1));
  const reviewsCount = (product.id * 13) % 180 + 15;
  const deliveryTime = product.is_organic ? '10-15 mins' : '20-30 mins';

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isCompared;
    setIsCompared(nextState);
    if (nextState) {
      showToast(`Added ${product.name} to comparison list`, 'success');
    } else {
      showToast(`Removed ${product.name} from comparison list`, 'info');
    }
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-4.5 hover-lift flex flex-col justify-between h-full shadow-xs hover:shadow-lg transition-all duration-300">
        
        {/* Badges / Actions Row */}
        <div className="flex items-center justify-between z-10 mb-2">
          <div>
            {product.is_organic ? (
              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30">
                <Leaf className="w-3 h-3 fill-current" /> Organic
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-450 border border-blue-100 dark:border-blue-900/30">
                Premium
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Compare Checkbox */}
            <button
              onClick={handleCompareToggle}
              title="Compare Product"
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              {isCompared ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-2 rounded-full border transition-all ${
                isWishlisted 
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-500' 
                  : 'bg-white dark:bg-gray-800 border-gray-150 dark:border-gray-700 text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-850 aspect-square flex items-center justify-center mb-4 group-hover:scale-102 transition-all duration-300">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-accent text-white font-black text-[10px] rounded-lg shadow-sm">
              {discountPercent}% OFF
            </span>
          )}

          {/* Quick View Hover overlay button */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-full font-bold text-xs shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-450 dark:text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
              {brandName}
            </span>
            <Link to={`/products/${product.id}`} className="font-extrabold text-gray-850 dark:text-white text-base hover:text-primary transition-colors block leading-snug line-clamp-1 mb-1">
              {product.name}
            </Link>
            
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold ml-1">{rating}</span>
              </div>
              <span className="text-gray-400 text-xs">({reviewsCount} reviews)</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/80 px-2 py-0.5 rounded-md font-semibold">
                {product.weight || '500g'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/80 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-primary" /> {deliveryTime}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80">
            {/* Pricing Info */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-black text-gray-900 dark:text-white">₹{product.price.toFixed(2)}</span>
              {product.mrp > product.price && (
                <span className="text-xs text-gray-405 line-through font-semibold">₹{product.mrp.toFixed(2)}</span>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="mb-3">
              {product.stock <= 0 ? (
                <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Out of stock
                </span>
              ) : product.stock < 10 ? (
                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                  Only {product.stock} items left!
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  ✓ In Stock
                </span>
              )}
            </div>

            {/* Add to Cart Actions */}
            {cartItem ? (
              <div className="flex items-center justify-between bg-primary-light dark:bg-primary/10 border border-primary/20 rounded-xl p-1">
                <button
                  onClick={() => updateCartQty(cartItem.id, cartItem.quantity - 1)}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-primary hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm text-primary-dark dark:text-primary">{cartItem.quantity}</span>
                <button
                  onClick={() => updateCartQty(cartItem.id, cartItem.quantity + 1)}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-primary hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product.id)}
                disabled={product.stock <= 0}
                className="w-full flex items-center justify-center gap-2 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs transition-all shadow-sm hover:shadow"
              >
                {product.stock <= 0 ? (
                  <span>Out of Stock</span>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Quick View Dialog / Modal overlay */}
      {isQuickViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-premium border border-gray-100 dark:border-gray-800 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsQuickViewOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Product Image */}
              <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product details info */}
              <div className="space-y-4 text-left">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    {brandName}
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                    {product.name}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold ml-1">{rating}</span>
                  </div>
                  <span className="text-gray-400 text-xs">({reviewsCount} customer reviews)</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">₹{product.price.toFixed(2)}</span>
                  {product.mrp > product.price && (
                    <span className="text-sm text-gray-400 line-through font-semibold">₹{product.mrp.toFixed(2)}</span>
                  )}
                </div>

                <div className="space-y-2 border-y border-gray-100 dark:border-gray-800 py-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {product.description || 'Fresh high-quality staple sourced with highest safety and testing standards.'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div>
                      <span className="text-gray-400 font-medium block">Shelf Life:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{product.shelf_life || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Origin:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{product.origin || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Actions in Modal */}
                <div className="pt-2 flex items-center gap-4">
                  {cartItem ? (
                    <div className="flex items-center justify-between bg-primary-light dark:bg-primary/10 border border-primary/20 rounded-xl p-1 w-32 shrink-0">
                      <button
                        onClick={() => updateCartQty(cartItem.id, cartItem.quantity - 1)}
                        className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-primary hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm text-primary-dark dark:text-primary">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateCartQty(cartItem.id, cartItem.quantity + 1)}
                        className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-primary hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock <= 0}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  )}

                  <button
                    onClick={() => {
                      toggleWishlist(product.id);
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      isWishlisted 
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-500' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
