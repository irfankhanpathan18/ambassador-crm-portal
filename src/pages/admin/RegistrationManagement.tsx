import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Pagination } from '../../components/Pagination';
import { Modal } from '../../components/Modal';
import { Registration, FilterOptions, Pagination as PaginationType } from '../../types';
import { getApiUrl } from '../../config/api';
import { Search, Download, Filter, RefreshCw, Eye, GraduationCap, Calendar, MapPin, BookOpen, Phone, Mail, User, Tag } from 'lucide-react';

export const RegistrationManagement: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationType>({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    colleges: [],
    cities: [],
    courses: [],
    years: [],
    ambassadors: []
  });

  // Filter & Search Controls
  const [search, setSearch] = useState<string>('');
  const [ambassadorId, setAmbassadorId] = useState<string>('');
  const [college, setCollege] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // View Details Modal
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('nxtwave_crm_token');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '25');

      if (search) params.append('search', search);
      if (ambassadorId) params.append('ambassador_id', ambassadorId);
      if (college) params.append('college', college);
      if (city) params.append('city', city);
      if (course) params.append('course', course);
      if (year) params.append('year', year);

      const res = await fetch(getApiUrl(`/api/registrations?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const json = await res.json();
        setRegistrations(json.data);
        setPagination(json.pagination);
        if (json.filterOptions) {
          setFilterOptions(json.filterOptions);
        }
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [page, search, ambassadorId, college, city, course, year]);

  const handleResetFilters = () => {
    setSearch('');
    setAmbassadorId('');
    setCollege('');
    setCity('');
    setCourse('');
    setYear('');
    setPage(1);
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem('nxtwave_crm_token');
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (ambassadorId) params.append('ambassador_id', ambassadorId);
    if (college) params.append('college', college);
    if (city) params.append('city', city);

    // Direct window trigger for download with bearer token auth
    fetch(getApiUrl(`/api/registrations/export?${params.toString()}`), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nxtwave_registrations_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => console.error('Export CSV error:', err));
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Registrations Management" subtitle="Manage and search all 500+ student registrations" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Control Bar with Search, Filters and Export CSV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Registration ID, student name, email, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            {/* Export CSV Button (Section 12) */}
            <button
              onClick={handleExportCsv}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Filter Dropdowns Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
            {/* Ambassador Filter */}
            <select
              value={ambassadorId}
              onChange={(e) => { setAmbassadorId(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Ambassadors</option>
              {filterOptions.ambassadors.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.referral_code})</option>
              ))}
            </select>

            {/* College Filter */}
            <select
              value={college}
              onChange={(e) => { setCollege(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Colleges</option>
              {filterOptions.colleges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* City Filter */}
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Cities</option>
              {filterOptions.cities.map((ct) => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>

            {/* Course Filter */}
            <select
              value={course}
              onChange={(e) => { setCourse(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Courses</option>
              {filterOptions.courses.map((crs) => (
                <option key={crs} value={crs}>{crs}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Years</option>
              {filterOptions.years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Reset Filters */}
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Registrations Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading registrations dataset...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <p className="text-sm font-semibold">No registrations match your search filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Reg ID</th>
                    <th className="py-3.5 px-6">Student Name</th>
                    <th className="py-3.5 px-6">Email / Phone</th>
                    <th className="py-3.5 px-6">College / City</th>
                    <th className="py-3.5 px-6">Course / Year</th>
                    <th className="py-3.5 px-6">Referred By</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
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
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{reg.ambassador_name}</p>
                        <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                          {reg.referral_code}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Server-side Pagination Component */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </main>

      {/* Registration Details Modal (Section 8 Prompt Requirement - NO status/approval buttons) */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Student Registration Details"
        maxWidth="lg"
      >
        {selectedRegistration && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Registration ID</p>
                <p className="text-2xl font-black font-mono tracking-wider">{selectedRegistration.registration_id}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Date Registered</p>
                <p className="text-xs font-semibold">{new Date(selectedRegistration.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Student Name</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedRegistration.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Email Address</p>
                  <p className="font-bold text-slate-900">{selectedRegistration.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Phone Number</p>
                  <p className="font-bold text-slate-900">{selectedRegistration.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">City</p>
                  <p className="font-bold text-slate-900">{selectedRegistration.city}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">College</p>
                  <p className="font-bold text-slate-900">{selectedRegistration.college}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Course & Year</p>
                  <p className="font-bold text-slate-900">{selectedRegistration.course} ({selectedRegistration.year})</p>
                </div>
              </div>
            </div>

            {/* Referred Ambassador Attribution */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Referred Ambassador</p>
                <p className="text-sm font-black text-slate-900">{selectedRegistration.ambassador_name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Referral Code</p>
                <span className="font-mono font-extrabold text-blue-700 bg-white px-3 py-1 rounded-md border border-blue-200 inline-block mt-0.5">
                  {selectedRegistration.referral_code}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
