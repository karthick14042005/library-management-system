import React from 'react';
import {
  Library,
  Shield,
  User,
  LogOut,
  Calendar,
  FastForward,
  RotateCcw,
} from 'lucide-react';
import { User as UserType, LibraryStats } from '../types';

interface HeaderProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  stats: LibraryStats | null;
  onTimeAdvance: (days: number) => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenLogin,
  stats,
  onTimeAdvance,
  onResetDemo,
}) => {
  const effectiveDate = stats?.effectiveDate ? new Date(stats.effectiveDate) : new Date();
  const formattedDate = effectiveDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Simulation Notice Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            System Date:{' '}
            <strong className="text-white font-medium">{formattedDate}</strong>
            {stats?.virtualDaysOffset ? (
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                +{stats.virtualDaysOffset}d Simulated Fast-Forward
              </span>
            ) : null}
          </span>
          <span className="text-slate-400 hidden sm:inline">| Overdue Fine Rate: ₹5 / day</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] hidden md:inline">Test Overdue Engine:</span>
          <button
            id="sim-advance-7"
            onClick={() => onTimeAdvance(7)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px]"
            title="Fast forward 7 days to simulate loan period progression"
          >
            <FastForward className="w-3 h-3 text-amber-400" />
            +7d
          </button>
          <button
            id="sim-advance-15"
            onClick={() => onTimeAdvance(15)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px]"
            title="Fast forward 15 days to trigger overdue fines"
          >
            <FastForward className="w-3 h-3 text-rose-400" />
            +15d (Overdue)
          </button>
          <button
            id="sim-reset-today"
            onClick={() => onTimeAdvance(0)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px]"
            title="Return to real-time current date"
          >
            Today
          </button>
          <button
            id="sim-reset-demo"
            onClick={onResetDemo}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 transition flex items-center gap-1 text-[11px]"
            title="Reset library catalogue, loans, and fines to initial state"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-sm ring-1 ring-amber-700/20">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                Digital Library
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-amber-50 text-amber-800 border border-amber-200">
                Management System
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Circulation, Cataloguing, Fines &amp; Advance Reservations
            </p>
          </div>
        </div>

        {/* User Status / Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-xs ${
                  currentUser.role === 'ADMIN' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}>
                  {currentUser.role === 'ADMIN' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800 max-w-[140px] truncate">
                      {currentUser.name}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {currentUser.memberId}
                  </span>
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                title="Sign out of current account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-login"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition shadow-xs"
            >
              <User className="w-4 h-4" />
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
