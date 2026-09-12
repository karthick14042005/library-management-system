import React, { useState, useEffect } from 'react';
import { X, BookPlus, Save, AlertCircle } from 'lucide-react';
import { Book } from '../types';

interface BookModalProps {
  isOpen: boolean;
  bookToEdit?: Book | null;
  onClose: () => void;
  onSave: (bookData: Partial<Book>) => Promise<void>;
}

const COMMON_CATEGORIES = [
  'Computer Science',
  'Software Engineering',
  'Mathematics',
  'Literature',
  'History',
  'Science Fiction',
  'Business & Economics',
  'Philosophy',
];

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  bookToEdit,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [customCategory, setCustomCategory] = useState('');
  const [quantity, setQuantity] = useState(3);
  const [shelfLocation, setShelfLocation] = useState('Rack CS-101');
  const [publishedYear, setPublishedYear] = useState(new Date().getFullYear());
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setIsbn(bookToEdit.isbn);
      if (COMMON_CATEGORIES.includes(bookToEdit.category)) {
        setCategory(bookToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(bookToEdit.category);
      }
      setQuantity(bookToEdit.quantity);
      setShelfLocation(bookToEdit.shelfLocation || '');
      setPublishedYear(bookToEdit.publishedYear || new Date().getFullYear());
      setCoverUrl(bookToEdit.coverUrl || '');
      setDescription(bookToEdit.description || '');
    } else {
      // Reset defaults
      setTitle('');
      setAuthor('');
      setIsbn(`978-0${Math.floor(100000000 + Math.random() * 900000000)}`);
      setCategory('Computer Science');
      setCustomCategory('');
      setQuantity(3);
      setShelfLocation('Rack B-101');
      setPublishedYear(new Date().getFullYear());
      setCoverUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80');
      setDescription('');
    }
    setError(null);
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const finalCategory = category === 'Other' ? customCategory.trim() : category;
      if (!finalCategory) {
        throw new Error('Please select or specify a valid category.');
      }

      await onSave({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category: finalCategory,
        quantity: Number(quantity),
        shelfLocation: shelfLocation.trim(),
        publishedYear: Number(publishedYear),
        coverUrl: coverUrl.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save book record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
              <BookPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                {bookToEdit ? 'Edit Book Record' : 'Catalogue New Book'}
              </h2>
              <p className="text-xs text-slate-500">
                {bookToEdit ? `Updating ISBN: ${bookToEdit.isbn}` : 'Add a new publication to the physical catalogue.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Book Title *
              </label>
              <input
                id="book-form-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Operating System Concepts"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author(s) *
              </label>
              <input
                id="book-form-author"
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Abraham Silberschatz"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ISBN Code *
              </label>
              <input
                id="book-form-isbn"
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 978-0132350884"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category / Subject *
              </label>
              <select
                id="book-form-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other / Custom...</option>
              </select>
            </div>

            {category === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specify Category *
                </label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Psychology"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Copies in Stock *
              </label>
              <input
                id="book-form-quantity"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shelf / Rack Location
              </label>
              <input
                id="book-form-shelf"
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="e.g. Rack CS-204"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Published Year
              </label>
              <input
                id="book-form-year"
                type="number"
                value={publishedYear}
                onChange={(e) => setPublishedYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cover Image URL (Optional)
              </label>
              <input
                id="book-form-cover"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Summary
              </label>
              <textarea
                id="book-form-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief synopsis, edition details, table of contents..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              id="btn-save-book"
              type="submit"
              disabled={loading}
              className="py-2 px-5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold transition shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Record...' : bookToEdit ? 'Update Book' : 'Add to Catalogue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
