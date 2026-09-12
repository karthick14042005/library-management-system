import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Calendar,
  User as UserIcon,
  Barcode,
  Search,
  Filter,
  IndianRupee,
} from 'lucide-react';
import { BookIssue, User } from '../types';

interface CirculationTableProps {
  issues: BookIssue[];
  currentUser: User | null;
  onReturnBook: (issue: BookIssue) => Promise<void>;
  currentEffectiveDate: string;
}

export const CirculationTable: React.FC<CirculationTableProps> = ({
  issues,
  currentUser,
  onReturnBook,
  currentEffectiveDate,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'OVERDUE' | 'RETURNED'>('ACTIVE');
  const [search, setSearch] = useState('');
  const [returningId, setReturningId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';
  const effectiveNow = new Date(currentEffectiveDate).getTime();

  const filteredIssues = issues.filter((issue) => {
    // Status filter
    if (filter === 'ACTIVE' && issue.status === 'RETURNED') return false;
    if (filter === 'OVERDUE' && issue.status !== 'OVERDUE') return false;
    if (filter === 'RETURNED' && issue.status !== 'RETURNED') return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = issue.book?.title.toLowerCase().includes(q);
      const userMatch = issue.user?.name.toLowerCase().includes(q) || issue.user?.memberId.toLowerCase().includes(q);
      const isbnMatch = issue.book?.isbn.toLowerCase().includes(q);
      return titleMatch || userMatch || isbnMatch;
    }
    return true;
  });

  const handleReturn = async (issue: BookIssue) => {
    setReturningId(issue.id);
    try {
      await onReturnBook(issue);
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            {isAdmin ? 'Circulation Registry & Issued Loans' : 'My Issued Books & Loan History'}
          </h3>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Tracking current circulation, due dates, borrower accountability, and returns.'
              : 'Keep track of borrowed copies and upcoming return deadlines (₹5/day late fee applies after due date).'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by book, borrower, ISBN..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-44 sm:w-56"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-0.5 bg-slate-200/70 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded-md transition ${
                filter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Loans
            </button>
            <button
              onClick={() => setFilter('OVERDUE')}
              className={`px-2.5 py-1 rounded-md transition ${
                filter === 'OVERDUE' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilter('RETURNED')}
              className={`px-2.5 py-1 rounded-md transition ${
                filter === 'RETURNED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Returned
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Book Details</th>
              {isAdmin && <th className="py-3 px-4">Borrower</th>}
              <th className="py-3 px-4">Issue Date</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status &amp; Fine</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Clock className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No loan records match the selected filter.</p>
                    <p className="text-xs text-slate-400">Issue a book from the catalogue to begin borrowing.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue) => {
                const dueDate = new Date(issue.dueDate);
                const isOverdue = issue.status === 'OVERDUE';
                const isReturned = issue.status === 'RETURNED';

                // Days remaining or overdue
                const diffDays = Math.ceil((dueDate.getTime() - effectiveNow) / (1000 * 60 * 60 * 24));

                return (
                  <tr
                    key={issue.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isOverdue ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    {/* Book Details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-12 rounded bg-slate-100 shrink-0 overflow-hidden border border-slate-200 shadow-2xs">
                          {issue.book?.coverUrl ? (
                            <img
                              src={issue.book.coverUrl}
                              alt={issue.book.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-700 bg-amber-50 text-[10px] font-bold">
                              BK
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-xs truncate max-w-xs">
                            {issue.book?.title || 'Unknown Title'}
                          </p>
                          <p className="text-slate-500 text-[11px] truncate">
                            by {issue.book?.author || 'Unknown'}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            ISBN: {issue.book?.isbn || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Borrower (Admin view) */}
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {issue.user?.name.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-xs">
                              {issue.user?.name || 'Member'}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {issue.user?.memberId || issue.userId}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Issue Date */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(issue.issueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4">
                      <div>
                        <span className={`font-semibold ${isOverdue ? 'text-rose-700' : 'text-slate-700'}`}>
                          {dueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {!isReturned && (
                          <p className="text-[10px] mt-0.5">
                            {isOverdue ? (
                              <span className="text-rose-600 font-medium">
                                Overdue by {Math.abs(diffDays)} day{Math.abs(diffDays) !== 1 ? 's' : ''}
                              </span>
                            ) : diffDays === 0 ? (
                              <span className="text-amber-600 font-medium">Due Today!</span>
                            ) : (
                              <span className="text-slate-400">
                                {diffDays} day{diffDays !== 1 ? 's' : ''} remaining
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status & Fine */}
                    <td className="py-3 px-4">
                      {isReturned ? (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                            Returned on{' '}
                            {issue.returnDate
                              ? new Date(issue.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : ''}
                          </span>
                        </div>
                      ) : isOverdue ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            OVERDUE
                          </span>
                          <div className="mt-1 flex items-center gap-1 text-rose-700 font-semibold text-xs">
                            <IndianRupee className="w-3 h-3" />
                            <span>Fine: ₹{issue.calculatedFine || 0}</span>
                            <span className="text-[10px] font-normal text-slate-500">(₹5/day)</span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" />
                          Active Loan
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      {!isReturned ? (
                        <button
                          id={`btn-return-issue-${issue.id}`}
                          onClick={() => handleReturn(issue)}
                          disabled={returningId === issue.id}
                          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition shadow-2xs inline-flex items-center gap-1.5 ${
                            isOverdue
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {returningId === issue.id
                            ? 'Processing...'
                            : isOverdue
                            ? `Return & Settle Fine`
                            : 'Return Book'}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Completed</span>
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
  );
};
