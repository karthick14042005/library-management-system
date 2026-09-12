import React, { useState, useEffect } from 'react';
import { Database, Code2, Table, Copy, Check, Info } from 'lucide-react';
import { api } from '../services/api';

export const DatabaseSchemaViewer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'TABLES' | 'SQL'>('TABLES');
  const [schemaData, setSchemaData] = useState<{ engine: string; ddl: string; tables: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getSchema().then(setSchemaData).catch(console.error);
  }, []);

  const copySql = () => {
    if (schemaData?.ddl) {
      navigator.clipboard.writeText(schemaData.ddl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const schemaTables = [
    {
      name: 'users',
      purpose: 'Registered system users: administrators, students, and faculty members.',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', description: 'Unique internal user ID' },
        { name: 'member_id', type: 'VARCHAR(20)', key: 'UNIQUE', description: 'Institutional ID (e.g. LIB-MEM-101)' },
        { name: 'name', type: 'VARCHAR(100)', key: '', description: 'Full legal name' },
        { name: 'email', type: 'VARCHAR(120)', key: 'UNIQUE INDEX', description: 'Official email address' },
        { name: 'password_hash', type: 'VARCHAR(255)', key: '', description: 'Encrypted credential' },
        { name: 'role', type: 'ENUM', key: '', description: 'ADMIN or USER' },
        { name: 'phone', type: 'VARCHAR(20)', key: '', description: 'Contact phone' },
        { name: 'status', type: 'ENUM', key: '', description: 'ACTIVE or SUSPENDED' },
        { name: 'joined_at', type: 'TIMESTAMP', key: '', description: 'Account creation date' },
      ],
    },
    {
      name: 'books',
      purpose: 'Complete library catalogue with inventory quantities and rack positions.',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', description: 'Unique book identifier' },
        { name: 'title', type: 'VARCHAR(255)', key: 'INDEX', description: 'Full title' },
        { name: 'author', type: 'VARCHAR(150)', key: 'INDEX', description: 'Primary author(s)' },
        { name: 'isbn', type: 'VARCHAR(20)', key: 'UNIQUE INDEX', description: '10/13 digit ISBN' },
        { name: 'category', type: 'VARCHAR(80)', key: 'INDEX', description: 'Genre / Academic field' },
        { name: 'quantity', type: 'INT', key: 'CHECK >= 0', description: 'Total physical copies owned' },
        { name: 'available_quantity', type: 'INT', key: 'CHECK <= quantity', description: 'Copies currently on shelf' },
        { name: 'shelf_location', type: 'VARCHAR(50)', key: '', description: 'Rack / Bay code' },
        { name: 'published_year', type: 'INT', key: '', description: 'Original publication year' },
      ],
    },
    {
      name: 'book_issues',
      purpose: 'Circulation transactions, tracking active loans, due dates, and returns.',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', description: 'Circulation transaction ID' },
        { name: 'book_id', type: 'VARCHAR(36)', key: 'FOREIGN KEY -> books', description: 'Borrowed book' },
        { name: 'user_id', type: 'VARCHAR(36)', key: 'FOREIGN KEY -> users', description: 'Borrowing member' },
        { name: 'issue_date', type: 'TIMESTAMP', key: '', description: 'Timestamp loan commenced' },
        { name: 'due_date', type: 'TIMESTAMP', key: 'INDEX', description: 'Calculated return deadline (14 days)' },
        { name: 'return_date', type: 'TIMESTAMP NULL', key: '', description: 'Actual check-in date' },
        { name: 'status', type: 'ENUM', key: 'INDEX', description: 'ISSUED, RETURNED, or OVERDUE' },
      ],
    },
    {
      name: 'fines',
      purpose: 'Automated penalty ledger assessing late fees at ₹5 per overdue day.',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', description: 'Fine ledger record ID' },
        { name: 'issue_id', type: 'VARCHAR(36)', key: 'FOREIGN KEY -> book_issues', description: 'Associated circulation loan' },
        { name: 'user_id', type: 'VARCHAR(36)', key: 'FOREIGN KEY -> users', description: 'Penalized member' },
        { name: 'amount', type: 'DECIMAL(10,2)', key: '', description: 'Total fine (₹5 * overdue days)' },
        { name: 'days_overdue', type: 'INT', key: '', description: 'Number of calendar days past due' },
        { name: 'status', type: 'ENUM', key: 'INDEX', description: 'UNPAID or PAID' },
        { name: 'paid_at', type: 'TIMESTAMP NULL', key: '', description: 'Payment clearance timestamp' },
      ],
    },
    {
      name: 'reservations',
      purpose: 'Advance bookings queue when all copies of a desired title are loaned out.',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', description: 'Hold reservation ID' },
        { name: 'book_id', type: 'VARCHAR(36)', key: 'FOREIGN KEY -> books', description: 'Reserved catalogue item' },
        { name: 'user_id', type: 'VARCHAR(36)', key: 'FOREIGN KEY -> users', description: 'Queued member' },
        { name: 'queue_position', type: 'INT', key: '', description: 'FIFO order in line' },
        { name: 'status', type: 'ENUM', key: 'INDEX', description: 'PENDING, READY_FOR_PICKUP, FULFILLED' },
      ],
    },
    {
      name: 'member_queries',
      purpose: 'Official communications and acquisition requests logged for administrator review.',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', description: 'Query ticket ID' },
        { name: 'user_id', type: 'VARCHAR(36)', key: 'FOREIGN KEY -> users', description: 'Inquiring member' },
        { name: 'subject', type: 'VARCHAR(200)', key: '', description: 'Topic summary' },
        { name: 'category', type: 'VARCHAR(50)', key: '', description: 'Book Request, Dispute, General' },
        { name: 'message', type: 'TEXT', key: '', description: 'Member query text' },
        { name: 'status', type: 'ENUM', key: '', description: 'PENDING or RESOLVED' },
        { name: 'admin_reply', type: 'TEXT NULL', key: '', description: 'Official response' },
      ],
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Relational Database Architecture &amp; Schema Design (MySQL / SQLite)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Designed according to Baeldung and MySQL standards: 6 normalized relational entities, foreign key constraints, and performance indexes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-0.5 bg-slate-200/70 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('TABLES')}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'TABLES' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Interactive Entity Tables
            </button>
            <button
              onClick={() => setViewMode('SQL')}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                viewMode === 'SQL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Raw SQL DDL Script
            </button>
          </div>

          {viewMode === 'SQL' && (
            <button
              onClick={copySql}
              className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied DDL' : 'Copy DDL'}
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {viewMode === 'TABLES' ? (
          <div className="space-y-6">
            {schemaTables.map((tbl) => (
              <div key={tbl.name} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-900 font-mono font-bold text-xs">
                      TABLE
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{tbl.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 italic hidden sm:inline">{tbl.purpose}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <th className="py-2 px-4 w-44">Column Name</th>
                        <th className="py-2 px-4 w-40">Data Type</th>
                        <th className="py-2 px-4 w-52">Keys &amp; Constraints</th>
                        <th className="py-2 px-4">Semantic Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {tbl.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-slate-50/50">
                          <td className="py-2 px-4 font-semibold text-slate-800">{col.name}</td>
                          <td className="py-2 px-4 text-blue-700">{col.type}</td>
                          <td className="py-2 px-4">
                            {col.key ? (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                col.key.includes('PRIMARY')
                                  ? 'bg-amber-100 text-amber-900'
                                  : col.key.includes('FOREIGN')
                                  ? 'bg-indigo-100 text-indigo-900'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {col.key}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="py-2 px-4 font-sans text-slate-600 text-[11px]">{col.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="bg-slate-900 text-amber-300 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-[500px] border border-slate-800">
              <pre className="whitespace-pre">{schemaData?.ddl || '-- Loading DDL schema...'}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
