import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  BookmarkPlus,
  Edit2,
  Trash2,
  MapPin,
  Barcode,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Book, User } from '../types';

interface BookCardProps {
  book: Book;
  currentUser: User | null;
  onIssue: (book: Book) => void;
  onReserve: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  isUserIssued?: boolean;
  isUserReserved?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  currentUser,
  onIssue,
  onReserve,
  onEdit,
  onDelete,
  isUserIssued,
  isUserReserved,
}) => {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isAvailable = book.availableQuantity > 0;
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div
      id={`book-card-${book.id}`}
      className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
    >
      <div>
        {/* Card Header with Category & Shelf */}
        <div className="p-4 pb-0 flex items-start gap-3">
          {/* Cover Image */}
          <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative shadow-xs">
            {!imgError && book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100/60 p-2 text-center">
                <BookOpen className="w-6 h-6 text-amber-700/60 mb-1" />
                <span className="text-[9px] font-bold text-amber-900 leading-tight line-clamp-2">
                  {book.title}
                </span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {book.category}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {book.publishedYear}
              </span>
            </div>

            <h3 className="font-serif font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-amber-700 transition">
              {book.title}
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">
              by {book.author}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Barcode className="w-3 h-3 text-slate-400" />
                {book.isbn}
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <MapPin className="w-3 h-3 text-amber-600" />
                {book.shelfLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Availability Status Indicator */}
        <div className="px-4 py-2.5 mt-3 border-y border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-600 font-medium">Copies:</span>
          </div>

          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              {book.availableQuantity} of {book.quantity} Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3 h-3" />
              0 of {book.quantity} (All Issued Out)
            </span>
          )}
        </div>

        {/* Description snippet */}
        {book.description && (
          <div className="px-4 py-2">
            <p className={`text-xs text-slate-500 leading-relaxed ${showFullDesc ? '' : 'line-clamp-2'}`}>
              {book.description}
            </p>
            {book.description.length > 90 && (
              <button
                type="button"
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 mt-0.5 inline-flex items-center gap-0.5"
              >
                {showFullDesc ? (
                  <>Less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>More <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between gap-2">
        {isAdmin ? (
          <div className="flex items-center gap-2 w-full">
            <button
              id={`btn-edit-book-${book.id}`}
              onClick={() => onEdit(book)}
              className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              Edit
            </button>
            <button
              id={`btn-delete-book-${book.id}`}
              onClick={() => onDelete(book)}
              className="py-1.5 px-2.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition flex items-center justify-center gap-1"
              title="Delete book record"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full">
            {isUserIssued ? (
              <div className="w-full py-1.5 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Currently In Your Loans
              </div>
            ) : isUserReserved ? (
              <div className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600" />
                Reserved (In Queue)
              </div>
            ) : isAvailable ? (
              <button
                id={`btn-issue-book-${book.id}`}
                onClick={() => onIssue(book)}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Issue Book (14-Day Loan)
              </button>
            ) : (
              <button
                id={`btn-reserve-book-${book.id}`}
                onClick={() => onReserve(book)}
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5"
                title="Book is currently loaned out. Place an advance reservation to be queued."
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Advance Booking (Reserve)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
