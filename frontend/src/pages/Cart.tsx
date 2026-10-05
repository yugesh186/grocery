import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { Trash2, ShoppingBag, ArrowRight, Sparkles, Percent } from 'lucide-react';

const Cart: React.FC = () => {
  const { cart, token, updateCartQty, removeFromCart, showToast } = useApp();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/coupons`);
      if (res.ok) {
        const coupons = await res.json();
        const matched = coupons.find((c: any) => c.code.toLowerCase() === couponCode.trim().toLowerCase());
        if (matched) {
          setDiscountPercent(matched.discount_percent);
          setCouponApplied(matched.code);
          showToast(`Coupon "${matched.code}" applied! ${matched.discount_percent}% Discount.`, "success");
        } else {
          showToast("Invalid or expired coupon code", "error");
        }
      }
    } catch {
      showToast("Error validation coupon", "error");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountPercent(0);
    setCouponApplied('');
    setCouponCode('');
    showToast("Coupon removed", "info");
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = (discountPercent / 100.0) * subtotal;
  const shipping = subtotal > 35 || subtotal === 0 ? 0.0 : 5.0;
  const taxes = 0.08 * (subtotal - discountAmount);
  const total = subtotal - discountAmount + shipping + taxes;

  const handleCheckoutRedirect = () => {
    if (!token) {
      showToast("Please log in to proceed to checkout", "info");
      navigate('/auth');
      return;
    }
    navigate(`/checkout?coupon=${couponApplied}`);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-5 font-sans">
        <span className="text-5xl block animate-bounce">🛒</span>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
          Looks like you haven't added any fresh groceries to your cart yet. Explore our organic categories!
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
        Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const itemDiscount = item.product.mrp > item.product.price
              ? Math.round(((item.product.mrp - item.product.price) / item.product.mrp) * 100)
              : 0;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow transition-shadow"
              >
                
                {/* Left: Product Image & Details */}
                <div className="flex gap-4 items-center text-left">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100 dark:border-gray-850 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-gray-850 dark:text-white leading-snug line-clamp-1">
                      {item.product.name}
                    </h3>
                    <span className="text-xs text-gray-400 font-semibold block mt-0.5">{item.product.weight}</span>
                    <div className="flex gap-2 items-center mt-2">
                      <span className="text-sm font-black text-gray-900 dark:text-white">₹{item.product.price.toFixed(2)}</span>
                      {item.product.mrp > item.product.price && (
                        <span className="text-xs text-gray-400 line-through">₹{item.product.mrp.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Adjusters & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl p-1">
                    <button
                      onClick={() => updateCartQty(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-650 hover:bg-gray-100 dark:hover:bg-gray-750 text-xs font-bold rounded-lg shadow-sm"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-xs text-gray-800 dark:text-white w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.id, item.quantity + 1)}
                      className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-650 hover:bg-gray-100 dark:hover:bg-gray-750 text-xs font-bold rounded-lg shadow-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Total item amount */}
                  <div className="text-right min-w-[70px]">
                    <span className="font-extrabold text-sm text-gray-950 dark:text-white">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>

        {/* Order Summary & checkout panel */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6 text-left">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Order Summary</h3>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs font-bold text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-850 dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-gray-850 dark:text-white">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Taxes (8%)</span>
                <span className="text-gray-850 dark:text-white">₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-855 pt-4">
                <span>Grand Total</span>
                <span className="text-primary text-base">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckoutRedirect}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-sm transition-all shadow-premium hover:shadow-premium-hover"
            >
              Checkout Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Coupon inputs panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3 text-left">
            <h4 className="font-bold text-xs text-gray-400 tracking-wide uppercase flex items-center gap-1">
              <Percent className="w-4.5 h-4.5 text-accent" /> Promotional Promo Code
            </h4>
            
            {couponApplied ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-emerald-700">{couponApplied}</span>
                  <span className="text-[10px] text-emerald-600 block">Applied successfully</span>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs font-bold text-red-500">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FRESH20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-xs font-semibold focus:bg-white focus:border-primary focus:outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold">
                  Apply
                </button>
              </form>
            )}
            <span className="text-[10px] text-gray-400 font-semibold block">Available Codes: FRESH20 (20% off), BOGO50 (50% off)</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Cart;
