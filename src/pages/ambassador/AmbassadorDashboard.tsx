import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { StatCard } from '../../components/StatCard';
import { Toast } from '../../components/Toast';
import { AmbassadorDashboardData } from '../../types';
import { getApiUrl } from '../../config/api';
import { FileSpreadsheet, Copy, Check, Sparkles, Link2, ExternalLink } from 'lucide-react';

export const AmbassadorDashboard: React.FC = () => {
  const [data, setData] = useState<AmbassadorDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const token = localStorage.getItem('nxtwave_crm_token');
        const res = await fetch(getApiUrl('/api/ambassadors/me/dashboard'), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Error fetching ambassador dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const handleCopyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setToastMessage('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Ambassador Dashboard" subtitle="Track your referral link, student registrations and performance" />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Main Metric Card: My Registrations (Section 9 Requirement) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="My Registrations"
            value={loading ? '...' : data?.myRegistrationsCount || 0}
            icon={FileSpreadsheet}
            color="emerald"
            subtitle="Total student registrations submitted via your link"
          />

          {/* My Referral Code Box */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-6 rounded-2xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-8xl pointer-events-none select-none">
              REF
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200">My Referral Code</p>
              <p className="text-3xl font-black font-mono mt-2 tracking-wider text-cyan-300">
                {loading ? '...' : data?.referralCode || 'N/A'}
              </p>
            </div>
            <p className="text-[11px] text-blue-100 mt-4 font-medium">
              Share this code or your referral link with prospective students
            </p>
          </div>

          {/* Quick Registration Form Helper */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Registration Link</p>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Direct students to your personal registration page URL to automatically capture your referral code.
              </p>
            </div>

            <Link
              to={data?.referralCode ? `/register?ref=${data.referralCode}` : '/register'}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Test Registration Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Unique Referral Link Box with Copy Link Button (Section 5 & 9 Requirement) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Your Unique Referral Link</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Active Referral Link
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              readOnly
              value={loading ? 'Loading link...' : data?.referralLink || ''}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-blue-700 select-all focus:outline-none"
            />

            <button
              onClick={handleCopyLink}
              disabled={loading || !data?.referralLink}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* My Recent Registrations Table (Section 9 Requirement) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Recent Registrations</h3>
              <p className="text-xs text-slate-500 font-medium">Students who registered using your referral code</p>
            </div>

            <a
              href="/ambassador/registrations"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All My Registrations →
            </a>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading your registrations...</p>
            </div>
          ) : !data?.recentRegistrations || data.recentRegistrations.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No student registrations yet.</p>
              <p className="text-xs mt-1">Share your referral link to start collecting registrations!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Registration ID</th>
                    <th className="py-3.5 px-6">Student Name</th>
                    <th className="py-3.5 px-6">College</th>
                    <th className="py-3.5 px-6 text-right">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.recentRegistrations.map((reg) => (
                    <tr key={reg.registration_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-blue-600">
                        {reg.registration_id}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {reg.name}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">
                        {reg.college}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 font-medium">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
