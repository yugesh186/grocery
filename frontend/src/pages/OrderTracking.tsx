import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { Package, ShieldCheck, MapPin, Calendar, Clock, ShoppingBag } from 'lucide-react';

interface OrderType {
  id: number;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_slot: string;
  coupon_code?: string;
  created_at: string;
  items: { id: number; quantity: number; price_at_purchase: number; product: { name: string; weight?: string; image_url?: string } }[];
}

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useApp();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll order status
  const loadOrder = () => {
    if (!token) return;
    fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
    // Poll status updates every 10 seconds
    const interval = setInterval(loadOrder, 10000);
    return () => clearInterval(interval);
  }, [id, token]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <span className="text-xs text-gray-400 mt-4 font-semibold block">Locating order delivery route...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order not found or unauthorized</h2>
        <Link to="/products" className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Helper arrays for timeline status
  const statuses = ['pending', 'accepted', 'packed', 'out_for_delivery', 'delivered'];
  const currentIdx = statuses.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans text-left space-y-8">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-800 pb-6 gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-primary-dark">
            🥬 Order Verified
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            Track Order #{order.id}
          </h1>
          <span className="text-xs text-gray-400 block mt-1">Placed on: {new Date(order.created_at).toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 font-bold block">Grand Total</span>
          <span className="text-2xl font-black text-primary">₹{order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Timeline view */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="font-extrabold text-gray-900 dark:text-white text-base mb-8">Delivery Timeline</h3>
        
        <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center gap-8 md:gap-4">
          {/* Timeline bar line */}
          <div className="absolute top-1/2 left-4 md:left-0 right-0 h-1 md:h-1 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 hidden md:block z-0" />

          {statuses.map((status, index) => {
            const isCompleted = index <= currentIdx;
            const isCurrent = index === currentIdx;

            return (
              <div key={status} className="flex md:flex-col items-center gap-4 z-10 relative">
                
                {/* Bubble node */}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted 
                    ? 'bg-primary border-primary text-white shadow-sm scale-110' 
                    : 'bg-white dark:bg-gray-950 border-gray-200 text-gray-300'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>

                <div className="text-left md:text-center">
                  <h4 className={`text-xs font-bold capitalize ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {status.replace(/_/g, ' ')}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] text-primary font-bold block animate-pulse">In Progress</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Details list and slot description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left: Shipping destination & timing */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Delivery Details</h3>
          
          <div className="space-y-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Shipping Destination</span>
                <p className="leading-relaxed">{order.delivery_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Scheduled Delivery Slot</span>
                <p className="leading-relaxed">{order.delivery_slot}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Items list summary */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Items Summary</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-850">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-250">
                <div className="flex gap-2 items-center">
                  <span>{item.product.name} ({item.product.weight})</span>
                  <span className="text-gray-400">x{item.quantity}</span>
                </div>
                <span>₹{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrderTracking;
