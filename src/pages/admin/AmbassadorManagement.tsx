import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { Ambassador } from '../../types';
import { UserPlus, Search, Edit3, Power, ExternalLink, Copy, Check, Eye } from 'lucide-react';

export const AmbassadorManagement: React.FC = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals & Toast State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    referral_code: '',
    password: ''
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAmbassadors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('nxtwave_crm_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/ambassadors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAmbassadors(data.ambassadors);
      }
    } catch (err) {
      console.error('Error fetching ambassadors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbassadors();
  }, [search, statusFilter]);

  const handleOpenAddModal = () => {
    setFormData({ name: '', email: '', college: '', referral_code: '', password: 'ambassador123' });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleAddAmbassador = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const token = localStorage.getItem('nxtwave_crm_token');
      const res = await fetch('/api/ambassadors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create ambassador');
      }

      setToastMessage(`Ambassador ${formData.name} created with code ${data.ambassador.referral_code}!`);
      setIsAddModalOpen(false);
      fetchAmbassadors();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEditModal = (amb: Ambassador) => {
    setSelectedAmbassador(amb);
    setFormData({
      name: amb.name,
      email: amb.email,
      college: amb.college,
      referral_code: amb.referral_code,
      password: ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditAmbassador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmbassador) return;

    setFormSubmitting(true);
    setFormError('');

    try {
      const token = localStorage.getItem('nxtwave_crm_token');
      const res = await fetch(`/api/ambassadors/${selectedAmbassador.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          college: formData.college
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update ambassador');

      setToastMessage('Ambassador details updated successfully');
      setIsEditModalOpen(false);
      fetchAmbassadors();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (amb: Ambassador) => {
    const newStatus = amb.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const token = localStorage.getItem('nxtwave_crm_token');
      const res = await fetch(`/api/ambassadors/${amb.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setToastMessage(`Ambassador status set to ${newStatus}`);
        fetchAmbassadors();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    setToastMessage('Referral link copied to clipboard!');
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Ambassador Management" subtitle="Manage ambassador profiles, referral codes and account activation" />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, college..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Ambassador</span>
          </button>
        </div>

        {/* Ambassador Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading ambassadors...</p>
            </div>
          ) : ambassadors.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No ambassadors found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Name & Email</th>
                    <th className="py-3.5 px-6">College</th>
                    <th className="py-3.5 px-6">Referral Code</th>
                    <th className="py-3.5 px-6 text-center">Total Registrations</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {ambassadors.map((amb) => (
                    <tr key={amb.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{amb.name}</p>
                        <p className="text-slate-500 text-[11px]">{amb.email}</p>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">{amb.college}</td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                          <span className="font-mono font-bold text-blue-700">{amb.referral_code}</span>
                          <button
                            onClick={() => handleCopyLink(amb.referral_code)}
                            title="Copy Referral Link"
                            className="text-blue-500 hover:text-blue-800 p-0.5"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-black text-slate-900 text-sm bg-slate-100 px-3 py-1 rounded-full">
                          {amb.total_registrations}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            amb.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${amb.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {amb.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedAmbassador(amb);
                              setIsViewModalOpen(true);
                            }}
                            title="View Details"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(amb)}
                            title="Edit Ambassador"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(amb)}
                            title={amb.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              amb.status === 'ACTIVE'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Ambassador Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Ambassador">
        <form onSubmit={handleAddAmbassador} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Irfan Pathan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="irfan@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">College Name</label>
            <input
              type="text"
              required
              placeholder="e.g. ABC College"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Referral Code (Optional - Auto-generated if blank)</label>
            <input
              type="text"
              placeholder="e.g. IRFAN123"
              value={formData.referral_code}
              onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              {formSubmitting ? 'Creating...' : 'Create Ambassador'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Ambassador Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Ambassador">
        <form onSubmit={handleEditAmbassador} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">College Name</label>
            <input
              type="text"
              required
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              {formSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Ambassador Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Ambassador Details">
        {selectedAmbassador && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase">Name</p>
                <p className="font-bold text-slate-900">{selectedAmbassador.name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase">Email</p>
                <p className="font-bold text-slate-900">{selectedAmbassador.email}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase">College</p>
                <p className="font-bold text-slate-900">{selectedAmbassador.college}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase">Referral Code</p>
                <p className="font-mono font-bold text-blue-600">{selectedAmbassador.referral_code}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase">Total Registrations</p>
                <p className="font-extrabold text-emerald-600 text-base">{selectedAmbassador.total_registrations}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase">Account Status</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedAmbassador.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  {selectedAmbassador.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Referral Link:</p>
              <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg text-xs font-mono">
                <span className="truncate flex-1">
                  {`${window.location.origin}/register?ref=${selectedAmbassador.referral_code}`}
                </span>
                <button
                  onClick={() => handleCopyLink(selectedAmbassador.referral_code)}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
