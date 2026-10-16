import React, { useState, useEffect } from 'react';
import { SecurityService } from '../../services/securityService';
import { ShieldAlert, ShieldCheck, X, Lock, EyeOff } from 'lucide-react';

interface SecurityAlertState {
  title: string;
  message: string;
  reason: string;
  timestamp: string;
}

export const AntiInspectShield: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<SecurityAlertState | null>(null);

  useEffect(() => {
    // Initialize the security manager listeners
    SecurityService.init();

    // Subscribe to security violation events
    const unsubscribe = SecurityService.subscribe((alert) => {
      setActiveAlert(alert);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setActiveAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!activeAlert) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md w-full animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-red-500/40 relative overflow-hidden">
        {/* Animated glowing border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-rose-600 animate-pulse" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">
                {activeAlert.title}
              </h4>
              <span className="text-[10px] bg-red-500/20 text-red-300 font-mono px-1.5 py-0.2 rounded border border-red-500/30">
                DILINDUNGI
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {activeAlert.message}
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-amber-300 font-medium">
                <Lock className="w-3 h-3 text-amber-400" />
                {activeAlert.reason}
              </span>
              <span className="font-mono text-slate-400">
                Waktu: {activeAlert.timestamp} WIB
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors absolute top-3 right-3 cursor-pointer"
            aria-label="Tutup Peringatan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
