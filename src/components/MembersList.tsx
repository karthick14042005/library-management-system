import React, { useState } from 'react';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  IndianRupee,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { User } from '../types';

interface MembersListProps {
  members: User[];
  onToggleStatus: (member: User) => Promise<void>;
}

export const MembersList: React.FC<MembersListProps> = ({ members, onToggleStatus }) => {
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q)
    );
  });

  const handleToggle = async (member: User) => {
    setUpdatingId(member.id);
    try {
      await onToggleStatus(member);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            Registered Library Members Directory
          </h3>
          <p className="text-xs text-slate-500">
            Manage student and faculty memberships, enforce borrowing limits, and handle suspensions.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, member ID, email..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-56 sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Member Info</th>
              <th className="py-3 px-4">Role &amp; Status</th>
              <th className="py-3 px-4">Contact Details</th>
              <th className="py-3 px-4">Active Circulation</th>
              <th className="py-3 px-4">Unpaid Fines</th>
              <th className="py-3 px-4 text-right">Account Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  No members found matching your search.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => {
                const isActive = member.status === 'ACTIVE';
                const isAdmin = member.role === 'ADMIN';

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition">
                    {/* Member Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {member.name}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400">
                            {member.memberId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {member.role}
                        </span>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                            <UserCheck className="w-3 h-3" />
                            Active Member
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-medium text-[11px]">
                            <UserX className="w-3 h-3" />
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Active Circulation */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>{member.activeLoansCount || 0} active</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        ({member.totalBorrowedCount || 0} total lifetime)
                      </span>
                    </td>

                    {/* Unpaid Fines */}
                    <td className="py-3 px-4">
                      {(member.unpaidFineAmount || 0) > 0 ? (
                        <div className="flex items-center gap-1 text-rose-700 font-bold">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>₹{member.unpaidFineAmount}</span>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-medium text-[11px]">₹0 (Clean)</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {isAdmin ? (
                        <span className="text-[11px] text-slate-400 font-medium italic">Super Admin</span>
                      ) : (
                        <button
                          id={`btn-toggle-status-${member.id}`}
                          onClick={() => handleToggle(member)}
                          disabled={updatingId === member.id}
                          className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition border ${
                            isActive
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {updatingId === member.id
                            ? 'Updating...'
                            : isActive
                            ? 'Suspend Account'
                            : 'Restore Active'}
                        </button>
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
