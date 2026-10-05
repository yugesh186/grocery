import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, Heart, User, Sun, Moon, Search, 
  ChevronDown, LogOut, LayoutDashboard, Award, Sparkles, Menu, X
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, cart, wishlist, darkMode, toggleDarkMode, logout, categories } = useApp();
  const [searchVal, setSearchVal] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-200/80 dark:border-gray-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-primary font-sans tracking-tight">
            <span className="text-3xl">🥬</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">FreshKart AI</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search organic tomatoes, whole milk, bakery..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-full focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:outline-none transition-all text-sm"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
          </form>

          {/* Nav Items Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            
            {/* Categories dropdown */}
            <div className="relative">
              <button 
                onClick={() => setCatOpen(!catOpen)}
                className="flex items-center gap-1 font-medium text-sm text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
              >
                Categories <ChevronDown className="w-4 h-4" />
              </button>
              {catOpen && (
                <div className="absolute top-8 left-0 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-premium py-2 z-50">
                  {categories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      onClick={() => setCatOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-primary-light hover:text-primary-dark transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-4 py-2 text-xs text-gray-400">No categories seeded</div>
                  )}
                </div>
              )}
            </div>

            {/* AI Recipes Planner Link */}
            <Link to="/recipes" className="flex items-center gap-1 font-medium text-sm text-gray-700 dark:text-gray-200 hover:text-primary transition-colors">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" /> AI Meal Planner
            </Link>

            {/* Dark Mode toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">
              <Heart className="w-5.5 h-5.5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              <ShoppingBag className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border border-primary/10">
                    {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[80px] truncate">{user.full_name}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="p-1.5 text-gray-500 hover:text-accent" title="Admin Portal">
                    <LayoutDashboard className="w-4 h-4" />
                  </Link>
                )}
                <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-500" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark shadow-premium hover:shadow-premium-hover transition-all">
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}

          </nav>

          {/* Mobile Menu buttons */}
          <div className="flex lg:hidden items-center gap-3">
            <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-300">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300">
              <ShoppingBag className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 space-y-4 animate-slide-in shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </form>

          <div className="flex flex-col gap-3 font-medium">
            <Link to="/products" onClick={() => setMenuOpen(false)} className="hover:text-primary text-sm py-1">Browse All Products</Link>
            <Link to="/recipes" onClick={() => setMenuOpen(false)} className="hover:text-primary text-sm flex items-center gap-1.5 py-1">
              <Sparkles className="w-4 h-4 text-accent" /> AI Meal Planner
            </Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="hover:text-primary text-sm py-1">Wishlist ({wishlist.length})</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-primary text-sm py-1">User Dashboard</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="hover:text-accent text-sm py-1">Admin Panel</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-red-500 text-sm py-1">Sign Out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="block text-center font-bold px-4 py-2 bg-primary text-white rounded-lg">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
