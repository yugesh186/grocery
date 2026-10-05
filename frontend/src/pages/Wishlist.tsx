import React, { useEffect, useState } from 'react';
import { useApp, API_BASE_URL, ProductType } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
  const { wishlist, token } = useApp();
  const [items, setItems] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistItems = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/orders/wishlist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setItems(data.map((i: any) => i.product) || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWishlistItems();
  }, [wishlist, token]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <span className="text-xs text-gray-400 mt-4 font-semibold block">Loading saved items...</span>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4 font-sans">
        <Heart className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">Please sign in to view and manage your custom grocery wishlist.</p>
        <Link to="/auth" className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm inline-block shadow-sm">
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4 font-sans">
        <span className="text-5xl block">❤️</span>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Tap the heart on any product card in our catalog to save items here for later shopping.
        </p>
        <Link to="/products" className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-bold text-sm shadow-premium transition-all">
          Browse Groceries <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
        Your Wishlist
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(prod => (
          <div key={prod.id}>
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
