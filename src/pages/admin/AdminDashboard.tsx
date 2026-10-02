import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { StatCard } from '../../components/StatCard';
import { AdminDashboardData } from '../../types';
import { FileSpreadsheet, Users, Trophy, TrendingUp, Calendar, Medal } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const token = localStorage.getItem('nxtwave_crm_token');
        const res = await fetch(`/api/admin/dashboard?trendPeriod=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [period]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Admin Dashboard" subtitle="Overview of student registrations and ambassador metrics" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Main Operational Metric Cards (Section 3 Prompt Requirements) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Total Registrations"
            value={loading ? '...' : data?.totalRegistrations || 0}
            icon={FileSpreadsheet}
            color="blue"
            subtitle="Students registered across all ambassador referral links"
          />
          <StatCard
            title="Total Ambassadors"
            value={loading ? '...' : data?.totalAmbassadors || 0}
            icon={Users}
            color="emerald"
            subtitle="Active student ambassadors driving referral campaigns"
          />
        </div>

        {/* Registration Trend Chart & Top Ambassadors Operational Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Trend Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Registration Trend</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Track student registration growth over time</p>
              </div>

              {/* Time Period Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['day', 'week', 'month'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      period === p
                        ? 'bg-white text-blue-600 shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }}
                      itemStyle={{ color: '#60A5FA', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#trendGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Ambassadors Operational Leaderboard */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>Top Ambassadors</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  By Count
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">Top performers by total registrations</p>

              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.topAmbassadors.slice(0, 5).map((amb, idx) => (
                    <div
                      key={amb.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 shadow-sm'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-900'
                              : idx === 2
                              ? 'bg-amber-600/30 text-amber-900'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{amb.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                            {amb.college}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-blue-600 block">
                          {amb.total_registrations}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">regs</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <a
                href="/admin/leaderboard"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <span>View Full Leaderboard</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
