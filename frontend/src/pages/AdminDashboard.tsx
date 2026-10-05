import React, { useEffect, useState } from 'react';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { LayoutDashboard, ShoppingBag, PlusCircle, Trash, PenTool, ClipboardList, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatType {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  category_chart: { name: string; value: number }[];
  recent_sales: { id: number; customer: string; status: string; amount: number; date: string }[];
  low_stock: { id: number; name: string; stock: number }[];
}

const AdminDashboard: React.FC = () => {
  const { user, token, categories, showToast } = useApp();
  const [stats, setStats] = useState<StatType | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'logs'>('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Product form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(0.0);
  const [prodMRP, setProdMRP] = useState(0.0);
  const [prodWeight, setProdWeight] = useState('');
  const [prodStock, setProdStock] = useState(10);
  const [prodCat, setProdCat] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodOrganic, setProdOrganic] = useState(false);

  // Seeding logs
  const [invLogs, setInvLogs] = useState<any[]>([]);

  // Load telemetry stats
  const loadStats = () => {
    if (!token) return;
    fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const loadLogs = () => {
    if (!token) return;
    fetch(`${API_BASE_URL}/admin/inventory/logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setInvLogs(data || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (!token || (user && user.role !== 'admin')) {
      showToast("Access restricted to Administrators", "error");
      navigate('/dashboard');
      return;
    }
    loadStats();
    loadLogs();
  }, [token, user]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodCat) {
      showToast("Please pick a category", "error");
      return;
    }

    const payload = {
      name: prodName,
      slug: prodName.toLowerCase().replace(/ /g, '-'),
      description: `Organic high quality fresh ${prodName}`,
      price: prodPrice,
      mrp: prodMRP,
      weight: prodWeight,
      image_url: prodImg || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
      stock: prodStock,
      category_id: Number(prodCat),
      is_organic: prodOrganic,
      shelf_life: "6 Days",
      origin: "Local Farm",
      nutrition: {"Calories": "45"},
      ingredients: prodName
    };

    try {
      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Product uploaded to catalog!", "success");
        // Clear fields
        setProdName('');
        setProdPrice(0);
        setProdMRP(0);
        setProdWeight('');
        setProdStock(10);
        setProdOrganic(false);
        setProdImg('');
        // Reload stats
        loadStats();
        loadLogs();
      } else {
        showToast("Failed to create product", "error");
      }
    } catch {
      showToast("Server error posting product", "error");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, nextStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status?status=${nextStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Order status updated!", "success");
        loadStats();
      }
    } catch {
      showToast("Error updating status", "error");
    }
  };

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <span className="text-xs text-gray-400 mt-4 font-semibold block">Initializing administrative console...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left space-y-10">
      
      {/* Header Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary" /> Admin Portal
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage grocery catalog levels, view orders pipeline and inventory logs</p>
        </div>

        <div className="flex gap-2">
          {['overview', 'products', 'logs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 text-gray-650 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 1. OVERVIEW TELEMETRY */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          
          {/* Dashboard top cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-gray-400 font-bold block mb-1">Total Revenue</span>
              <span className="text-2xl font-black text-gray-955 dark:text-white">₹{stats.revenue.toFixed(2)}</span>
            </div>
            
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-gray-400 font-bold block mb-1">Total Orders</span>
              <span className="text-2xl font-black text-gray-950 dark:text-white">{stats.orders}</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-gray-400 font-bold block mb-1">Active Customers</span>
              <span className="text-2xl font-black text-gray-950 dark:text-white">{stats.customers}</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-gray-400 font-bold block mb-1">Catalog Size</span>
              <span className="text-2xl font-black text-gray-950 dark:text-white">{stats.products} Items</span>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sales pipeline list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Recent Sales Flow</h3>
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-4 overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-gray-600 dark:text-gray-300 divide-y divide-gray-100">
                  <thead>
                    <tr className="text-gray-400 text-[10px] uppercase font-bold">
                      <th className="py-2.5">Order ID</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recent_sales.map(s => (
                      <tr key={s.id}>
                        <td className="py-3">#{s.id}</td>
                        <td className="py-3">{s.customer}</td>
                        <td className="py-3 font-extrabold text-gray-850 dark:text-white">₹{s.amount.toFixed(2)}</td>
                        <td className="py-3">
                          <select
                            value={s.status}
                            onChange={(e) => handleUpdateOrderStatus(s.id, e.target.value)}
                            className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold p-1 rounded border-none focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="packed">Packed</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low stock alerts panel */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Stock Alerts</h3>
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 space-y-3">
                {stats.low_stock.map(ls => (
                  <div key={ls.id} className="flex justify-between items-center p-2.5 bg-red-50 border border-red-100 rounded-xl">
                    <span className="text-xs font-bold text-red-700 truncate max-w-[150px]">{ls.name}</span>
                    <span className="text-[10px] font-extrabold text-white bg-red-500 px-2 py-0.5 rounded">
                      Only {ls.stock} Left
                    </span>
                  </div>
                ))}
                {stats.low_stock.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">All products are healthy stocked.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. PRODUCTS CATALOG BUILDER FORM */}
      {activeTab === 'products' && (
        <div className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-extrabold text-gray-900 dark:text-white text-xl flex items-center gap-1.5">
            <PlusCircle className="w-6 h-6 text-primary" /> Create New Catalog Product
          </h2>

          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-bold text-gray-600">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-gray-450 uppercase tracking-wide">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Strawberries"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-gray-450 uppercase tracking-wide">Weight / Portion</label>
                <input
                  type="text"
                  placeholder="e.g. 500g, 1 Gallon"
                  value={prodWeight}
                  onChange={(e) => setProdWeight(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-gray-450 uppercase tracking-wide">Sale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-gray-450 uppercase tracking-wide">MRP ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={prodMRP}
                  onChange={(e) => setProdMRP(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-gray-450 uppercase tracking-wide">Initial Inventory Stock</label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-gray-450 uppercase tracking-wide">Category ID</label>
                <select
                  value={prodCat}
                  onChange={(e) => setProdCat(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-gray-450 uppercase tracking-wide">Image URL</label>
                <input
                  type="text"
                  placeholder="https://unsplash.com/..."
                  value={prodImg}
                  onChange={(e) => setProdImg(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl max-w-[200px]">
              <input
                type="checkbox"
                id="orgCheck"
                checked={prodOrganic}
                onChange={(e) => setProdOrganic(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="orgCheck" className="text-gray-700 cursor-pointer">Organic Certified</label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-premium"
            >
              Upload Product
            </button>

          </form>
        </div>
      )}

      {/* 3. STOCK HISTORY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-gray-950 dark:text-white text-base">Historic Stock Logs</h3>
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-gray-600 dark:text-gray-300 divide-y divide-gray-100">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase font-bold">
                  <th className="py-2">Log ID</th>
                  <th className="py-2">Product ID</th>
                  <th className="py-2">Qty Change</th>
                  <th className="py-2">Action Type</th>
                  <th className="py-2">Remarks</th>
                  <th className="py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invLogs.map(log => (
                  <tr key={log.id}>
                    <td className="py-2.5">#{log.id}</td>
                    <td className="py-2.5">Prod #{log.product_id}</td>
                    <td className={`py-2.5 font-bold ${log.quantity_changed >= 0 ? 'text-primary' : 'text-red-500'}`}>
                      {log.quantity_changed >= 0 ? `+${log.quantity_changed}` : log.quantity_changed}
                    </td>
                    <td className="py-2.5 font-bold uppercase text-[9px]">{log.type}</td>
                    <td className="py-2.5 text-gray-400 font-medium">{log.remarks || 'Stock flow adjustment'}</td>
                    <td className="py-2.5 text-[10px] text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
