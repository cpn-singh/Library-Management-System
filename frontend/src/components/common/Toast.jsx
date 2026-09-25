import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function Toast() {
  const { toast, clearToast } = useLibrary();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />
  };

  const borderColors = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
    error: 'border-rose-200 bg-rose-50/90 text-rose-950',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-950',
    info: 'border-indigo-200 bg-indigo-50/90 text-indigo-950'
  };

  return (
    <div className="fixed bottom-4 sm:bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-50 sm:max-w-md animate-bounce-in shadow-xl rounded-xl overflow-hidden pointer-events-auto">
      <div className={`border p-3.5 sm:p-4 rounded-xl backdrop-blur-md flex items-start gap-3 shadow-lg ${borderColors[toast.type] || borderColors.info}`}>
        {icons[toast.type] || icons.info}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold capitalize">{toast.title || toast.type}</p>
          <p className="text-sm mt-0.5 leading-snug break-words opacity-90">{toast.message}</p>
        </div>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-slate-700 transition p-1 -mr-1 -mt-1 rounded-lg"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
