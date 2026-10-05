import React, { createContext, useContext, useState, useEffect } from 'react';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface ProductType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  mrp: number;
  weight?: string;
  image_url?: string;
  stock: number;
  category_id: number;
  is_organic: boolean;
  shelf_life?: string;
  origin?: string;
  nutrition?: Record<string, string>;
  ingredients?: string;
}

export interface CartItemType {
  id: number;
  product: ProductType;
  quantity: number;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
}

export interface ToastType {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: UserProfile | null;
  token: string | null;
  cart: CartItemType[];
  wishlist: number[]; // Array of product IDs
  darkMode: boolean;
  toasts: ToastType[];
  categories: { id: number; name: string; slug: string; icon: string }[];
  
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
  toggleDarkMode: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  
  // Cart Actions
  addToCart: (productId: number, qty?: number) => Promise<void>;
  updateCartQty: (itemId: number, qty: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCartLocally: () => void;
  fetchCart: () => Promise<void>;

  // Wishlist Actions
  toggleWishlist: (productId: number) => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fk_token'));
  const [cart, setCart] = useState<CartItemType[]>(() => {
    try {
      const guestCart = localStorage.getItem('fk_guest_cart');
      return guestCart ? JSON.parse(guestCart) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const guestWishlist = localStorage.getItem('fk_guest_wishlist');
      return guestWishlist ? JSON.parse(guestWishlist) : [];
    } catch {
      return [];
    }
  });
  const [darkMode, setDarkMode] = useState<boolean>(localStorage.getItem('fk_theme') === 'dark');
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [categories, setCategories] = useState([]);

  // Toast notifier helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts([{ id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 2000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Dark Mode helper
  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('fk_theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch initial profile
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Fetch categories
    fetch(`${API_BASE_URL}/products/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error loading categories", err));

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    if (!token) {
      logout();
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchCart();
        fetchWishlist();
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.detail || "Incorrect email or password", "error");
        return false;
      }
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('fk_token', data.access_token);
        setToken(data.access_token);
        showToast("Logged in successfully!", "success");
        return true;
      }
      return false;
    } catch (err: any) {
      showToast("Could not connect to authentication server", "error");
      return false;
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.detail || "Could not complete registration", "error");
        return false;
      }
      showToast("Account created! Please log in.", "success");
      return true;
    } catch (err: any) {
      showToast("Could not connect to registration server", "error");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('fk_token');
    setToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
    showToast("Signed out successfully", "info");
  };

  // Cart operations
  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error("Cart retrieval failed", err);
    }
  };

  const addToCart = async (productId: number, qty: number = 1) => {
    if (!token) {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (res.ok) {
          const product = await res.json();
          setCart(prev => {
            const existing = prev.find(item => item.product.id === productId);
            let updated;
            if (existing) {
              updated = prev.map(item => item.product.id === productId ? { ...item, quantity: item.quantity + qty } : item);
            } else {
              updated = [...prev, { id: productId, product, quantity: qty }];
            }
            localStorage.setItem('fk_guest_cart', JSON.stringify(updated));
            return updated;
          });
          showToast(`Added ${product.name} to cart (Guest Mode)!`, "success");
        }
      } catch {
        showToast("Error updating cart", "error");
      }
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/orders/cart?product_id=${productId}&quantity=${qty}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Item added to cart!", "success");
        fetchCart();
      } else {
        const err = await res.json();
        showToast(err.detail || "Unable to add item", "error");
      }
    } catch {
      showToast("Server error during cart add", "error");
    }
  };

  const updateCartQty = async (itemId: number, qty: number) => {
    if (!token) {
      if (qty <= 0) {
        removeFromCart(itemId);
        return;
      }
      setCart(prev => {
        const updated = prev.map(item => item.id === itemId ? { ...item, quantity: qty } : item);
        localStorage.setItem('fk_guest_cart', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/orders/cart/${itemId}?quantity=${qty}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCart();
      } else {
        const err = await res.json();
        showToast(err.detail || "Unable to update cart quantity", "error");
      }
    } catch {
      showToast("Server error updating cart quantity", "error");
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!token) {
      setCart(prev => {
        const updated = prev.filter(item => item.id !== itemId);
        localStorage.setItem('fk_guest_cart', JSON.stringify(updated));
        return updated;
      });
      showToast("Item removed from cart", "info");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/orders/cart/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Item removed", "info");
        fetchCart();
      }
    } catch {
      showToast("Error updating cart", "error");
    }
  };

  const clearCartLocally = () => {
    setCart([]);
  };

  // Wishlist operations
  const fetchWishlist = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data.map((item: any) => item.product.id));
      }
    } catch (err) {
      console.error("Wishlist retrieval failed", err);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (!token) {
      const isPresent = wishlist.includes(productId);
      let updated;
      if (isPresent) {
        updated = wishlist.filter(id => id !== productId);
        showToast("Removed from wishlist (Guest Mode)", "info");
      } else {
        updated = [...wishlist, productId];
        showToast("Added to wishlist (Guest Mode)", "success");
      }
      setWishlist(updated);
      localStorage.setItem('fk_guest_wishlist', JSON.stringify(updated));
      return;
    }
    const isPresent = wishlist.includes(productId);
    try {
      if (isPresent) {
        // Find wish item id
        const getRes = await fetch(`${API_BASE_URL}/orders/wishlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (getRes.ok) {
          const list = await getRes.json();
          const match = list.find((item: any) => item.product.id === productId);
          if (match) {
            await fetch(`${API_BASE_URL}/orders/wishlist/${match.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            showToast("Removed from wishlist", "info");
          }
        }
      } else {
        await fetch(`${API_BASE_URL}/orders/wishlist?product_id=${productId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        showToast("Added to wishlist", "success");
      }
      fetchWishlist();
    } catch {
      showToast("Could not modify wishlist", "error");
    }
  };

  return (
    <AppContext.Provider value={{
      user, token, cart, wishlist, darkMode, toasts, categories,
      showToast, removeToast, toggleDarkMode, login, logout, register,
      addToCart, updateCartQty, removeFromCart, clearCartLocally, fetchCart,
      toggleWishlist, fetchWishlist
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
};
export { API_BASE_URL };
