import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { KeyRound, Mail, User, ArrowRight } from 'lucide-react';

const Auth: React.FC = () => {
  const { login, register, user } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const success = await login(email, password);
      if (success) navigate('/dashboard');
    } else {
      const success = await register(email, password, fullName);
      if (success) {
        setIsLogin(true); // Switch to login after successful register
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md w-full mx-auto my-16 px-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-premium transition-all duration-300">
        
        {/* Header Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-4 text-center font-bold text-lg border-b-2 transition-all ${
              isLogin ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-4 text-center font-bold text-lg border-b-2 transition-all ${
              !isLogin ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 mb-6 font-medium">
          💡 Setup Tip: Register the first account on the platform to automatically grant it **Administrator** privileges!
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-850 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all text-sm"
                required
              />
              <User className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-850 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all text-sm"
              required
            />
            <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-850 border border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all text-sm"
              required
            />
            <KeyRound className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-premium hover:shadow-premium-hover disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          Demo Accounts:<br />
          Admin: <span className="font-semibold text-gray-600 dark:text-gray-300">admin@freshkart.ai</span> (pw: <span className="font-semibold text-gray-600 dark:text-gray-300">admin123</span>)<br />
          Customer: <span className="font-semibold text-gray-600 dark:text-gray-300">user@freshkart.ai</span> (pw: <span className="font-semibold text-gray-600 dark:text-gray-300">user123</span>)
        </div>

      </div>
    </div>
  );
};

export default Auth;
