import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Clock,
  IndianRupee,
  Bookmark,
  Users,
  MessageSquare,
  Database,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Shield,
  User as UserIcon,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  User,
  Book,
  BookIssue,
  Fine,
  Reservation,
  MemberQuery,
  LibraryStats,
  CategoryInfo,
} from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { BookCard } from './components/BookCard';
import { BookModal } from './components/BookModal';
import { CirculationTable } from './components/CirculationTable';
import { FinesManager } from './components/FinesManager';
import { MembersList } from './components/MembersList';
import { ReservationsList } from './components/ReservationsList';
import { QueriesDesk } from './components/QueriesDesk';
import { DatabaseSchemaViewer } from './components/DatabaseSchemaViewer';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Current user state (persisted in localStorage for convenience)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('dlms_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [queries, setQueries] = useState<MemberQuery[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<string>('CATALOGUE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  // Notification / Toast
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch all core data
  const loadAllData = useCallback(async () => {
    try {
      const [statsData, booksData, catsData] = await Promise.all([
        api.getStats(),
        api.getBooks({
          category: selectedCategory,
          search: searchQuery,
          availableOnly,
        }),
        api.getCategories(),
      ]);

      setStats(statsData);
      setBooks(booksData);
      setCategories(catsData);

      // Load circulation, fines, reservations, queries based on role
      if (currentUser?.role === 'ADMIN') {
        const [allIssues, allFines, allRes, allQueries, allMembers] = await Promise.all([
          api.getIssues(),
          api.getFines(),
          api.getReservations(),
          api.getQueries(),
          api.getMembers(),
        ]);
        setIssues(allIssues);
        setFines(allFines);
        setReservations(allRes);
        setQueries(allQueries);
        setMembers(allMembers);
      } else if (currentUser) {
        const [myIssues, myFines, myRes, myQueries] = await Promise.all([
          api.getIssues(currentUser.id),
          api.getFines(currentUser.id),
          api.getReservations(currentUser.id),
          api.getQueries(currentUser.id),
        ]);
        setIssues(myIssues);
        setFines(myFines);
        setReservations(myRes);
        setQueries(myQueries);
      }
    } catch (err: any) {
      console.error('Error loading library data:', err);
    }
  }, [currentUser?.id, currentUser?.role, selectedCategory, searchQuery, availableOnly]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle user authentication
  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('dlms_user', JSON.stringify(user));
    showToast(`Welcome back, ${user.name}! (${user.role} role active)`);
    if (user.role === 'ADMIN' && activeTab.startsWith('MY_')) {
      setActiveTab('CATALOGUE');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dlms_user');
    showToast('Signed out successfully.', 'info');
  };

  // Fast-forward or Reset time simulation
  const handleTimeAdvance = async (days: number) => {
    try {
      await api.setTimeOffset(days);
      await loadAllData();
      showToast(
        days === 0
          ? 'System time reset to current calendar date.'
          : `Fast-forwarded +${days} days. Overdue fines and loan statuses re-evaluated.`
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      await loadAllData();
      showToast('Library database reset to default demo records.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // --- ACTIONS ---
  const handleIssueBook = async (book: Book) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await api.issueBook(currentUser.id, book.id, 14);
      showToast(`"${book.title}" successfully issued for 14 days! Due date recorded.`);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleReturnBook = async (issue: BookIssue) => {
    try {
      const res = await api.returnBook(issue.id);
      if (res.fineAmount > 0) {
        showToast(`Book checked in. Overdue by ${res.fineRecord?.daysOverdue} days. Late fine: ₹${res.fineAmount}.`, 'info');
      } else {
        showToast('Book returned successfully with no overdue fine! Inventory count updated.');
      }
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleReserveBook = async (book: Book) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await api.createReservation(currentUser.id, book.id);
      showToast(`Advance booking placed for "${book.title}". You are #${res.queuePosition} in line.`);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelReservation = async (resId: string) => {
    try {
      await api.cancelReservation(resId, currentUser?.id);
      showToast('Advance reservation cancelled.');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handlePayFine = async (fine: Fine) => {
    try {
      await api.payFine(fine.id);
      showToast(`Fine of ₹${fine.amount} cleared and recorded as paid!`);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveBook = async (bookData: Partial<Book>) => {
    try {
      if (bookToEdit) {
        await api.updateBook(bookToEdit.id, bookData);
        showToast(`Book "${bookData.title}" updated successfully.`);
      } else {
        await api.addBook(bookData);
        showToast(`"${bookData.title}" added to physical catalogue.`);
      }
      setBookToEdit(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}" (ISBN: ${book.isbn}) from the library catalogue?`)) {
      return;
    }
    try {
      await api.deleteBook(book.id);
      showToast(`"${book.title}" deleted from records.`);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleMemberStatus = async (member: User) => {
    const nextStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateMemberStatus(member.id, nextStatus);
      showToast(`Member ${member.name} (${member.memberId}) is now ${nextStatus}.`);
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmitQuery = async (queryData: { subject: string; category: string; message: string }) => {
    if (!currentUser) return;
    await api.submitQuery({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      ...queryData,
    });
    showToast('Query submitted to administration.');
    loadAllData();
  };

  const handleReplyQuery = async (id: string, reply: string) => {
    await api.replyQuery(id, reply);
    showToast('Official response logged and query resolved.');
    loadAllData();
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  // Fast switch demo profiles in banner if not signed in
  const quickSwitch = async (email: string, pass: string) => {
    try {
      const res = await api.login({ email, password: pass });
      handleUserLogin(res.user);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* App Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        stats={stats}
        onTimeAdvance={handleTimeAdvance}
        onResetDemo={handleResetDemo}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 text-xs font-semibold ${
              notification.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : notification.type === 'info'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-emerald-900 text-white border-emerald-800'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : notification.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Demo Role Switcher (If not logged in, or quick toggle) */}
        {!currentUser && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">
                  Select a Demonstration Role to Begin
                </h3>
                <p className="text-xs text-slate-600">
                  Experience full role-based features with pre-configured Admin (Librarian) and Member accounts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-demo-admin"
                onClick={() => quickSwitch('admin@library.gov', 'admin123')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5" />
                Demo Librarian (Admin)
              </button>
              <button
                id="btn-demo-user"
                onClick={() => quickSwitch('rohit@example.com', 'user123')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Demo Member (Rohit)
              </button>
              <button
                id="btn-open-auth-custom"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
              >
                Sign In / Register
              </button>
            </div>
          </div>
        )}

        {/* Stats Metrics Banner */}
        <StatsBanner stats={stats} currentUser={currentUser} />

        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-200 mb-6 flex items-center justify-between overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-4">
            {/* Common / Catalogue Tab */}
            <button
              id="tab-catalogue"
              onClick={() => setActiveTab('CATALOGUE')}
              className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'CATALOGUE'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Book Catalogue
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                {books.length}
              </span>
            </button>

            {/* Admin Tabs */}
            {isAdmin ? (
              <>
                <button
                  id="tab-admin-issues"
                  onClick={() => setActiveTab('ISSUES')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'ISSUES'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  All Issued Books
                  {stats?.activeIssues ? (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                      {stats.activeIssues}
                    </span>
                  ) : null}
                </button>

                <button
                  id="tab-admin-members"
                  onClick={() => setActiveTab('MEMBERS')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'MEMBERS'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Member Accounts
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                    {members.length}
                  </span>
                </button>

                <button
                  id="tab-admin-fines"
                  onClick={() => setActiveTab('FINES')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'FINES'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  Fine Management
                  {stats?.pendingFines ? (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px]">
                      ₹{stats.pendingFines}
                    </span>
                  ) : null}
                </button>

                <button
                  id="tab-admin-reservations"
                  onClick={() => setActiveTab('RESERVATIONS')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'RESERVATIONS'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  Advance Bookings
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                    {reservations.length}
                  </span>
                </button>

                <button
                  id="tab-admin-queries"
                  onClick={() => setActiveTab('QUERIES')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'QUERIES'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Member Queries
                  {stats?.pendingQueries ? (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                      {stats.pendingQueries}
                    </span>
                  ) : null}
                </button>

                <button
                  id="tab-admin-schema"
                  onClick={() => setActiveTab('SCHEMA')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'SCHEMA'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  MySQL Database Design
                </button>
              </>
            ) : currentUser ? (
              /* User Tabs */
              <>
                <button
                  id="tab-user-my-issues"
                  onClick={() => setActiveTab('MY_ISSUES')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'MY_ISSUES'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  My Issued Books
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                    {issues.filter(i => i.status !== 'RETURNED').length}
                  </span>
                </button>

                <button
                  id="tab-user-my-fines"
                  onClick={() => setActiveTab('MY_FINES')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'MY_FINES'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  My Fines
                  {fines.filter(f => f.status === 'UNPAID').length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px]">
                      {fines.filter(f => f.status === 'UNPAID').length}
                    </span>
                  )}
                </button>

                <button
                  id="tab-user-my-reservations"
                  onClick={() => setActiveTab('MY_RESERVATIONS')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'MY_RESERVATIONS'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  My Reservations
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                    {reservations.length}
                  </span>
                </button>

                <button
                  id="tab-user-help"
                  onClick={() => setActiveTab('HELP_DESK')}
                  className={`py-3 px-3 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'HELP_DESK'
                      ? 'border-amber-600 text-amber-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Help &amp; Queries
                </button>
              </>
            ) : null}
          </nav>

          {/* Admin Add Book Shortcut */}
          {isAdmin && (
            <button
              id="btn-add-book-header"
              onClick={() => {
                setBookToEdit(null);
                setIsBookModalOpen(true);
              }}
              className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shrink-0 shadow-xs mb-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Catalogue New Book
            </button>
          )}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'CATALOGUE' && (
          <div className="space-y-5">
            {/* Search & Category Filter Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="catalogue-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalogue by book title, author, or ISBN..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Dropdown */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    id="catalogue-category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="py-1.5 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="All">All Categories ({stats?.totalBooks || books.length})</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available Only Checkbox */}
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Available on Shelf Only</span>
                </label>
              </div>
            </div>

            {/* Category Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'All'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Titles
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedCategory === cat.name
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1 rounded-full ${
                    selectedCategory === cat.name ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Books Grid */}
            {books.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-base font-semibold text-slate-800">No books found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No catalogue records match "{searchQuery}" in category "{selectedCategory}".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setAvailableOnly(false);
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {books.map((book) => {
                  const isUserIssued = issues.some(
                    (i) => i.bookId === book.id && i.userId === currentUser?.id && i.status !== 'RETURNED'
                  );
                  const isUserReserved = reservations.some(
                    (r) => r.bookId === book.id && r.userId === currentUser?.id && (r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP')
                  );

                  return (
                    <BookCard
                      key={book.id}
                      book={book}
                      currentUser={currentUser}
                      onIssue={handleIssueBook}
                      onReserve={handleReserveBook}
                      onEdit={(b) => {
                        setBookToEdit(b);
                        setIsBookModalOpen(true);
                      }}
                      onDelete={handleDeleteBook}
                      isUserIssued={isUserIssued}
                      isUserReserved={isUserReserved}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ISSUES TAB */}
        {(activeTab === 'ISSUES' || activeTab === 'MY_ISSUES') && (
          <CirculationTable
            issues={issues}
            currentUser={currentUser}
            onReturnBook={handleReturnBook}
            currentEffectiveDate={stats?.effectiveDate || new Date().toISOString()}
          />
        )}

        {/* FINES TAB */}
        {(activeTab === 'FINES' || activeTab === 'MY_FINES') && (
          <FinesManager
            fines={fines}
            currentUser={currentUser}
            onPayFine={handlePayFine}
          />
        )}

        {/* MEMBERS TAB (Admin only) */}
        {activeTab === 'MEMBERS' && isAdmin && (
          <MembersList
            members={members}
            onToggleStatus={handleToggleMemberStatus}
          />
        )}

        {/* RESERVATIONS TAB */}
        {(activeTab === 'RESERVATIONS' || activeTab === 'MY_RESERVATIONS') && (
          <ReservationsList
            reservations={reservations}
            currentUser={currentUser}
            onCancelReservation={handleCancelReservation}
            onIssueReservedBook={async (bookId) => {
              const b = books.find((x) => x.id === bookId);
              if (b) await handleIssueBook(b);
            }}
          />
        )}

        {/* QUERIES TAB */}
        {(activeTab === 'QUERIES' || activeTab === 'HELP_DESK') && (
          <QueriesDesk
            queries={queries}
            currentUser={currentUser}
            onSubmitQuery={handleSubmitQuery}
            onReplyQuery={handleReplyQuery}
          />
        )}

        {/* SCHEMA TAB (Admin only) */}
        {activeTab === 'SCHEMA' && isAdmin && <DatabaseSchemaViewer />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-800">Digital Library Management System</span>
            <span>•</span>
            <span>MySQL / SQLite Relational Engine</span>
            <span>•</span>
            <span>Automated ₹5/day Overdue Fines</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Admin &amp; Member RBAC Portals</span>
            <span>•</span>
            <button
              onClick={() => {
                setActiveTab('SCHEMA');
                if (!isAdmin) {
                  quickSwitch('admin@library.gov', 'admin123');
                }
              }}
              className="hover:text-amber-700 underline transition"
            >
              View MySQL DDL Schema
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleUserLogin}
      />

      {/* Add / Edit Book Modal */}
      <BookModal
        isOpen={isBookModalOpen}
        bookToEdit={bookToEdit}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookToEdit(null);
        }}
        onSave={handleSaveBook}
      />
    </div>
  );
}
