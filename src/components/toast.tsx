'use client';

import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'error', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    error: <AlertCircle className="text-red-500" size={24} />,
    success: <CheckCircle className="text-green-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div className={`${styles[type]} border-2 rounded-lg shadow-lg p-4 pr-12 max-w-md flex items-start gap-3`}>
        {icons[type]}
        <p className="font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}