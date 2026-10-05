import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { Truck, CreditCard, ChevronRight, Calendar, Sparkles } from 'lucide-react';

const Checkout: React.FC = () => {
  const { cart, token, fetchCart, clearCartLocally, showToast } = useApp();
  const [searchParams] = useSearchParams();
  const coupon = searchParams.get('coupon') || '';
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [slot, setSlot] = useState('09:00 AM - 11:00 AM');
  const [payMethod, setPayMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Calculate discount dynamically if coupon exists
  const discountPercent = coupon === 'FRESH20' ? 20 : coupon === 'BOGO50' ? 50 : 0;
  const discountAmount = (discountPercent / 100.0) * subtotal;
  const shipping = subtotal > 35 ? 0.0 : 5.0;
  const taxes = 0.08 * (subtotal - discountAmount);
  const total = subtotal - discountAmount + shipping + taxes;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      showToast("Please enter a valid shipping address", "error");
      return;
    }
    setLoading(true);

    try {
      // Build checkout endpoint URL
      let url = `${API_BASE_URL}/orders/checkout?delivery_address=${encodeURIComponent(address)}&delivery_slot=${encodeURIComponent(slot)}`;
      if (coupon) url += `&coupon_code=${coupon}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const order = await res.json();
        showToast("Order placed successfully!", "success");
        clearCartLocally();
        // Redirect to tracking page
        navigate(`/orders/${order.id}`);
      } else {
        const err = await res.json();
        showToast(err.detail || "Checkout failed", "error");
      }
    } catch {
      showToast("Server error during placement", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
        Billing & Checkout
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Form fields */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Address field */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-1.5">
              <Truck className="w-5 h-5 text-primary" /> 1. Shipping Address
            </h3>
            <textarea
              placeholder="House/Apartment No, Street, City, ZIP Code..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full min-h-[80px] p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none text-xs transition-colors"
              required
            />
          </div>

          {/* Delivery Slot scheduler */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-primary" /> 2. Preferred Delivery Slot
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                "09:00 AM - 11:00 AM",
                "01:00 PM - 03:00 PM",
                "06:00 PM - 08:00 PM"
              ].map(timeSlot => (
                <button
                  type="button"
                  key={timeSlot}
                  onClick={() => setSlot(timeSlot)}
                  className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                    slot === timeSlot
                      ? 'border-primary bg-primary-light/30 text-primary'
                      : 'border-gray-100 hover:border-gray-250 text-gray-500'
                  }`}
                >
                  {timeSlot}
                </button>
              ))}
            </div>
          </div>

          {/* Payment option selectors */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-1.5">
              <CreditCard className="w-5 h-5 text-primary" /> 3. Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPayMethod('card')}
                className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold transition-all ${
                  payMethod === 'card'
                    ? 'border-primary bg-primary-light/30 text-primary'
                    : 'border-gray-100 text-gray-500'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${payMethod === 'card' ? 'border-primary' : 'border-gray-300'}`}>
                  {payMethod === 'card' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                </div>
                Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('cod')}
                className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold transition-all ${
                  payMethod === 'cod'
                    ? 'border-primary bg-primary-light/30 text-primary'
                    : 'border-gray-100 text-gray-500'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${payMethod === 'cod' ? 'border-primary' : 'border-gray-300'}`}>
                  {payMethod === 'cod' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                </div>
                Cash on Delivery (COD)
              </button>
            </div>
          </div>

        </div>

        {/* Order total checkout preview sidepanel */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Billing Review</h3>

            {/* Calculations review */}
            <div className="space-y-3 text-xs font-bold text-gray-500 border-b border-gray-100 pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-850 dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Coupon discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery charge</span>
                <span className="text-gray-850 dark:text-white">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Taxes (8%)</span>
                <span className="text-gray-850 dark:text-white">₹{taxes.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-sm font-extrabold text-gray-900 dark:text-white pb-6">
              <span>Payable Total</span>
              <span className="text-primary text-base">₹{total.toFixed(2)}</span>
            </div>

            {/* Form submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-sm transition-all shadow-premium"
            >
              {loading ? 'Processing...' : 'Place Secure Order'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </form>

    </div>
  );
};

export default Checkout;
