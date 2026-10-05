import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Leaf, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Footer: React.FC = () => {
  const { categories, showToast } = useApp();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      showToast("Thank you for subscribing to our AI newsletter!", "success");
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Info Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-2xl">
            <span>🥬</span>
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">FreshKart AI</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            FreshKart AI is a premium, Apple-inspired grocery supermarket leveraging AI to make healthy meal planning and weekly shopping effortless.
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +1 (800) 555-KART</div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> support@freshkart.ai</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> 100 Infinite Loop, Cupertino, CA</div>
          </div>
        </div>

        {/* Categories Column */}
        <div>
          <h3 className="text-white font-bold text-base mb-4 tracking-wide">Popular Categories</h3>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 5).map((cat: any) => (
              <li key={cat.id}>
                <Link to={`/products?category=${cat.id}`} className="hover:text-primary transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/products" className="hover:text-primary transition-colors font-medium text-xs text-primary">
                View All Categories →
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="text-white font-bold text-base mb-4 tracking-wide">Customer Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/dashboard" className="hover:text-primary transition-colors">My Profile</Link></li>
            <li><Link to="/cart" className="hover:text-primary transition-colors">Shopping Cart</Link></li>
            <li><Link to="/recipes" className="hover:text-primary transition-colors font-semibold flex items-center gap-1"><Leaf className="w-3.5 h-3.5 text-primary" /> AI Meal Planner</Link></li>
            <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-base mb-4 tracking-wide">Join Our Newsletter</h3>
          <p className="text-sm text-gray-400">
            Subscribe for healthy recipes, smart kitchen checklists, and weekly discount promo codes.
          </p>
          <form onSubmit={handleSubscribe} className="flex relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-primary focus:outline-none transition-colors pr-10"
              required
            />
            <button
              type="submit"
              className="absolute right-1 top-1 p-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        © 2026 FreshKart AI Inc. Built with premium Apple-inspired minimalism. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
