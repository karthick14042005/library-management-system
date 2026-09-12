import React, { useState } from 'react';
import {
  Bookmark,
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  Calendar,
  AlertCircle,
  BellRing,
} from 'lucide-react';
import { Reservation, User, Book } from '../types';

interface ReservationsListProps {
  reservations: Reservation[];
  currentUser: User | null;
  onCancelReservation: (resId: string) => Promise<void>;
  onIssueReservedBook: (bookId: string) => Promise<void>;
}

export const ReservationsList: React.FC<ReservationsListProps> = ({
  reservations,
  currentUser,
  onCancelReservation,
  onIssueReservedBook,
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [issuingId, setIssuingId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await onCancelReservation(id);
    } finally {
      setCancellingId(null);
    }
  };

  const handleIssue = async (bookId: string, resId: string) => {
    setIssuingId(resId);
    try {
      await onIssueReservedBook(bookId);
    } finally {
      setIssuingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-600" />
            {isAdmin ? 'Advance Bookings & Reservation Queue' : 'My Book Reservations'}
          </h3>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Members who placed advance holds on loaned-out titles, prioritized by queue position.'
              : 'When a loaned title is returned, members holding reservations are prioritized in line.'}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Book Title</th>
              {isAdmin && <th className="py-3 px-4">Reserved By</th>}
              <th className="py-3 px-4">Date Placed</th>
              <th className="py-3 px-4">Queue Position</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Bookmark className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No active advance bookings in queue.</p>
                    <p className="text-xs text-slate-400">
                      When copies of a title are completely issued out, you can reserve it from the catalogue.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reservations.map((res) => {
                const isReady = res.status === 'READY_FOR_PICKUP';
                const isPending = res.status === 'PENDING';

                return (
                  <tr key={res.id} className={`hover:bg-slate-50/80 transition ${isReady ? 'bg-amber-50/40' : ''}`}>
                    {/* Book */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 font-bold text-xs">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {res.book?.title || 'Book Title'}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ISBN: {res.book?.isbn} | Shelf: {res.book?.shelfLocation}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Member (Admin view) */}
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800 text-xs">{res.user?.name || 'Member'}</p>
                          <span className="font-mono text-[10px] text-slate-400">
                            {res.user?.memberId || res.userId}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Date Placed */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(res.reservationDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Queue Position */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        #{res.queuePosition} in Line
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isReady ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <BellRing className="w-3 h-3 text-amber-600" />
                          READY FOR PICKUP
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" />
                          Waiting on Return
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">{res.status}</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isReady && !isAdmin && (
                          <button
                            onClick={() => handleIssue(res.bookId, res.id)}
                            disabled={issuingId === res.id}
                            className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {issuingId === res.id ? 'Claiming...' : 'Claim & Issue'}
                          </button>
                        )}
                        {(isPending || isReady) && (
                          <button
                            id={`btn-cancel-res-${res.id}`}
                            onClick={() => handleCancel(res.id)}
                            disabled={cancellingId === res.id}
                            className="py-1 px-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-medium transition flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {cancellingId === res.id ? 'Cancelling...' : 'Cancel Hold'}
                          </button>
                        )}
                      </div>
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
