import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  User as UserIcon,
  CornerDownRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { MemberQuery, User } from '../types';

interface QueriesDeskProps {
  queries: MemberQuery[];
  currentUser: User | null;
  onSubmitQuery: (queryData: {
    subject: string;
    category: string;
    message: string;
  }) => Promise<void>;
  onReplyQuery: (id: string, reply: string) => Promise<void>;
}

export const QueriesDesk: React.FC<QueriesDeskProps> = ({
  queries,
  currentUser,
  onSubmitQuery,
  onReplyQuery,
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'General' | 'Book Request' | 'Account Issue' | 'Fine Dispute' | 'Other'>('Book Request');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Admin reply state
  const [activeReplyingId, setActiveReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmitQuery({
        subject: subject.trim(),
        category,
        message: message.trim(),
      });
      setSubject('');
      setMessage('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit query.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await onReplyQuery(id, replyText.trim());
      setActiveReplyingId(null);
      setReplyText('');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* If Member: Show Submit Form */}
      {!isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">
                Library Help Desk &amp; Book Procurement Query
              </h3>
              <p className="text-xs text-slate-500">
                Have a question about loans, want to request a new acquisition, or dispute an overdue fine? Send a direct message to the librarian.
              </p>
            </div>
          </div>

          {submitSuccess && (
            <div className="my-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your query has been submitted to the administration desk. You will receive a response here.</span>
            </div>
          )}

          {submitError && (
            <div className="my-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject / Topic *
                </label>
                <input
                  id="query-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Request new textbook for CS semester 6..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  id="query-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="Book Request">Book Request</option>
                  <option value="Fine Dispute">Fine Dispute</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="General">General Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Message / Inquiry *
              </label>
              <textarea
                id="query-message"
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include relevant details, ISBN if requesting a book, or loan reference..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                id="btn-submit-query"
                type="submit"
                disabled={submitting}
                className="py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting...' : 'Send Query to Librarian'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Queries List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              {isAdmin ? 'Member Queries & Assistance Requests' : 'My Previous Inquiries & Librarian Replies'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAdmin
                ? 'Review member inquiries, answer book requests, and resolve dispute tickets.'
                : 'Tracking your communications and official librarian replies.'}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-full">
            {queries.length} Total
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {queries.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No query tickets found.</p>
              <p className="text-xs text-slate-400">Queries submitted by members will appear here.</p>
            </div>
          ) : (
            queries.map((q) => {
              const isResolved = q.status === 'RESOLVED';

              return (
                <div key={q.id} className="p-4 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {q.category}
                      </span>
                      <h4 className="font-semibold text-slate-900 text-sm">{q.subject}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {new Date(q.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    <span>From: <strong>{q.userName}</strong> ({q.userEmail})</span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {q.message}
                  </p>

                  {/* Admin Reply Thread */}
                  {q.adminReply && (
                    <div className="mt-3 pl-4 border-l-2 border-indigo-500 bg-indigo-50/40 p-3 rounded-r-lg">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 mb-1">
                        <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Library Staff Response:</span>
                        {q.repliedAt && (
                          <span className="text-[10px] text-indigo-600 font-normal">
                            ({new Date(q.repliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-950 leading-relaxed">{q.adminReply}</p>
                    </div>
                  )}

                  {/* Admin Reply Action */}
                  {isAdmin && (
                    <div className="mt-3">
                      {activeReplyingId === q.id ? (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type official response to member..."
                            className="w-full p-2 text-xs rounded border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-white"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReplyingId(null);
                                setReplyText('');
                              }}
                              className="py-1 px-3 rounded text-xs border border-slate-300 text-slate-600 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendReply(q.id)}
                              disabled={replying || !replyText.trim()}
                              className="py-1 px-3 rounded text-xs bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              {replying ? 'Sending...' : 'Send & Mark Resolved'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveReplyingId(q.id);
                            setReplyText(q.adminReply || '');
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition inline-flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          {q.adminReply ? 'Update Official Response' : 'Reply to Member Query'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
