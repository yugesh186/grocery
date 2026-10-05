import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-premium border transition-all duration-300 animate-slide-in glass-panel ${
            toast.type === 'success' ? 'border-primary/20 bg-white/90' :
            toast.type === 'error' ? 'border-red-500/20 bg-white/90' :
            'border-blue-500/20 bg-white/90'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="text-primary w-5 h-5 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertTriangle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />}

          <div className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            {toast.message}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
