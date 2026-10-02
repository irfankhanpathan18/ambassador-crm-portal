import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Pagination } from '../../components/Pagination';
import { Registration, Pagination as PaginationType } from '../../types';
import { Search } from 'lucide-react';

export const MyRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationType>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const fetchMyRegistrations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('nxtwave_crm_token');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (search) params.append('search', search);

      const res = await fetch(`/api/ambassadors/me/registrations?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const json = await res.json();
        setRegistrations(json.registrations);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error('Error fetching my registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRegistrations();
  }, [page, search]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="My Registrations" subtitle="List of all student registrations driven by your referral link" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, registration ID, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading your student registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No registrations found matching search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Registration ID</th>
                    <th className="py-3.5 px-6">Student Name</th>
                    <th className="py-3.5 px-6">Email / Phone</th>
                    <th className="py-3.5 px-6">College / City</th>
                    <th className="py-3.5 px-6">Course / Year</th>
                    <th className="py-3.5 px-6 text-right">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {registrations.map((reg) => (
                    <tr key={reg.registration_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-blue-600">
                        {reg.registration_id}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {reg.name}
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-800 font-medium">{reg.email}</p>
                        <p className="text-[11px] text-slate-400">{reg.phone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-800 font-medium">{reg.college}</p>
                        <p className="text-[11px] text-slate-400">{reg.city}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-800 font-medium">{reg.course}</p>
                        <p className="text-[11px] font-semibold text-blue-600">{reg.year}</p>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 font-medium whitespace-nowrap">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </main>
    </div>
  );
};
