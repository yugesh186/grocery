import React, { useEffect, useState } from 'react';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { ShoppingBag, Eye, Calendar, Sparkles, MapPin, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface OrderHistoryType {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_slot: string;
}

const UserDashboard: React.FC = () => {
  const { user, token } = useApp();
  const [orders, setOrders] = useState<OrderHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    fetch(`${API_BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <span className="text-xs text-gray-400 mt-4 font-semibold block">Retrieving profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left space-y-12">
      
      {/* Profile summary banner */}
      {user && (
        <div className="bg-gradient-to-r from-primary-light/50 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-950 dark:to-emerald-950/20 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-primary/20 text-primary border border-primary/10 flex items-center justify-center font-extrabold text-3xl shrink-0">
            {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{user.full_name}</h2>
            <span className="text-xs text-gray-400 font-semibold block mt-1">{user.email}</span>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase">
                {user.role} Account
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" /> Gold Club Member
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Dashboard Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Orders History */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-extrabold text-gray-950 dark:text-white text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" /> Active & Previous Orders
          </h3>

          {orders.length === 0 ? (
            <div className="p-8 bg-white dark:bg-gray-900 border border-gray-100 rounded-3xl text-center space-y-3">
              <span className="text-3xl block">📦</span>
              <p className="text-xs text-gray-400">You haven't placed any grocery orders yet.</p>
              <Link to="/products" className="inline-block px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-sm">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow transition-shadow"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-white block">Order #{order.id}</span>
                    <span className="text-[10px] text-gray-400 block font-medium">Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                      order.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                      'bg-orange-50 text-orange-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="text-xs text-gray-450 block font-semibold">Total</span>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">₹{order.total_amount.toFixed(2)}</span>
                    </div>
                    <Link
                      to={`/orders/${order.id}`}
                      className="p-2.5 bg-gray-50 hover:bg-primary hover:text-white text-gray-400 rounded-xl transition-all"
                      title="View tracking status"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Member perks / coupons */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-gray-950 dark:text-white text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent" /> Available Club Coupons
          </h3>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-primary-light/30 border border-emerald-100 rounded-2xl text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-white px-2 py-0.5 rounded shadow-sm">20% Off</span>
              <h4 className="font-black text-sm text-gray-850 mt-2">FRESH20</h4>
              <p className="text-[10px] text-gray-400 mt-1">Get 20% flat discount on organic fresh fruits and bread baskets.</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-50 to-accent/15 border border-orange-100 rounded-2xl text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-white px-2 py-0.5 rounded shadow-sm">50% Off</span>
              <h4 className="font-black text-sm text-gray-850 mt-2">BOGO50</h4>
              <p className="text-[10px] text-gray-400 mt-1">Limited summer flash sale code. Save 50% on all grocery cart purchases.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default UserDashboard;
