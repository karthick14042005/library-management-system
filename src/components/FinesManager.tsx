import React, { useState } from 'react';
import {
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Receipt,
  User as UserIcon,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { Fine, User } from '../types';

interface FinesManagerProps {
  fines: Fine[];
  currentUser: User | null;
  onPayFine: (fine: Fine) => Promise<void>;
}

export const FinesManager: React.FC<FinesManagerProps> = ({
  fines,
  currentUser,
  onPayFine,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('UNPAID');
  const [payingId, setPayingId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  const totalOutstanding = fines
    .filter((f) => f.status === 'UNPAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalCollected = fines
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const filteredFines = fines.filter((fine) => {
    if (filter === 'UNPAID') return fine.status === 'UNPAID';
    if (filter === 'PAID') return fine.status === 'PAID';
    return true;
  });

  const handlePay = async (fine: Fine) => {
    setPayingId(fine.id);
    try {
      await onPayFine(fine);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Revenue & Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isAdmin ? 'Pending Overdue Fines' : 'My Unpaid Fines'}
            </p>
            <p className="text-2xl font-bold text-rose-700 mt-1">₹{totalOutstanding}</p>
            <span className="text-[11px] text-slate-400">Calculated at ₹5/day</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isAdmin ? 'Total Fines Collected' : 'Fines Cleared / Paid'}
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">₹{totalCollected}</p>
            <span className="text-[11px] text-slate-400">Official library receipts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Institutional Policy
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">Standard 14 Days</p>
            <span className="text-[11px] text-slate-500">Loans over 14 days incur ₹5 per overdue day</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-600" />
              {isAdmin ? 'Overdue Fine Collection Ledger' : 'My Fine Records'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAdmin
                ? 'Review member overdue penalties, receive cash/online payments, and issue receipts.'
                : 'Overdue penalties incurred from late book returns. Clear fines to maintain borrowing eligibility.'}
            </p>
          </div>

          <div className="flex items-center p-0.5 bg-slate-200/70 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setFilter('UNPAID')}
              className={`px-3 py-1 rounded-md transition ${
                filter === 'UNPAID'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unpaid ({fines.filter((f) => f.status === 'UNPAID').length})
            </button>
            <button
              onClick={() => setFilter('PAID')}
              className={`px-3 py-1 rounded-md transition ${
                filter === 'PAID'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid Receipts ({fines.filter((f) => f.status === 'PAID').length})
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md transition ${
                filter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({fines.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Book Reference</th>
                {isAdmin && <th className="py-3 px-4">Member</th>}
                <th className="py-3 px-4">Overdue Days</th>
                <th className="py-3 px-4">Fine Amount</th>
                <th className="py-3 px-4">Status &amp; Timestamp</th>
                <th className="py-3 px-4 text-right">Payment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <p className="text-sm font-medium text-slate-700">No fine records found in this category.</p>
                      <p className="text-xs text-slate-400">All accounts are currently in good standing!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFines.map((fine) => {
                  const isUnpaid = fine.status === 'UNPAID';

                  return (
                    <tr key={fine.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 font-bold text-xs">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">
                              {fine.book?.title || 'Library Title'}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">
                              ISBN: {fine.book?.isbn || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {isAdmin && (
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-800 text-xs">
                              {fine.user?.name || 'Member'}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {fine.user?.memberId || fine.userId}
                            </span>
                          </div>
                        </td>
                      )}

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">
                          {fine.daysOverdue} day{fine.daysOverdue !== 1 ? 's' : ''}
                        </span>
                        <p className="text-[10px] text-slate-400">@ ₹5.00/day</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-sm font-bold ${isUnpaid ? 'text-rose-700' : 'text-emerald-700'}`}>
                          ₹{fine.amount.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isUnpaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            UNPAID
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              PAID
                            </span>
                            {fine.paidAt && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Paid on {new Date(fine.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isUnpaid ? (
                          <button
                            id={`btn-pay-fine-${fine.id}`}
                            onClick={() => handlePay(fine)}
                            disabled={payingId === fine.id}
                            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-2xs inline-flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            {payingId === fine.id
                              ? 'Processing...'
                              : isAdmin
                              ? 'Mark as Paid'
                              : 'Settle Fine (₹' + fine.amount + ')'}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">Cleared ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
