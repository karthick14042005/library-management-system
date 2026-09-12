import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  Bookmark,
  Users,
} from 'lucide-react';
import { LibraryStats, User } from '../types';

interface StatsBannerProps {
  stats: LibraryStats | null;
  currentUser: User | null;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ stats, currentUser }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Books */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">Total Books</p>
          <p className="text-xl font-bold text-slate-900">{stats.totalBooks}</p>
          <span className="text-[11px] text-slate-400 truncate block">{stats.uniqueTitles} titles</span>
        </div>
      </div>

      {/* Available */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">On Shelves</p>
          <p className="text-xl font-bold text-emerald-700">{stats.availableCopies}</p>
          <span className="text-[11px] text-slate-400 truncate block">Ready to borrow</span>
        </div>
      </div>

      {/* Issued / Active Loans */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">Active Loans</p>
          <p className="text-xl font-bold text-blue-700">{stats.activeIssues}</p>
          <span className="text-[11px] text-slate-400 truncate block">{stats.issuedCopies} copies out</span>
        </div>
      </div>

      {/* Overdue Items */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">Overdue</p>
          <p className="text-xl font-bold text-rose-700">{stats.overdueIssues}</p>
          <span className="text-[11px] text-rose-500 font-medium truncate block">Fines accruing</span>
        </div>
      </div>

      {/* Fines Outstanding */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
          <IndianRupee className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">Pending Fines</p>
          <p className="text-xl font-bold text-purple-700">₹{stats.pendingFines}</p>
          <span className="text-[11px] text-slate-400 truncate block">₹{stats.totalFinesCollected} paid</span>
        </div>
      </div>

      {/* Reservations or Members */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
          {currentUser?.role === 'ADMIN' ? (
            <Users className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">
            {currentUser?.role === 'ADMIN' ? 'Total Members' : 'Reservations'}
          </p>
          <p className="text-xl font-bold text-indigo-700">
            {currentUser?.role === 'ADMIN' ? stats.totalMembers : stats.activeReservations}
          </p>
          <span className="text-[11px] text-slate-400 truncate block">
            {currentUser?.role === 'ADMIN' ? `${stats.activeReservations} in queue` : 'Active holds'}
          </span>
        </div>
      </div>
    </div>
  );
};
