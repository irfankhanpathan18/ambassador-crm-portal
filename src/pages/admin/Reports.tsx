import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { StatCard } from '../../components/StatCard';
import { ReportData } from '../../types';
import { getApiUrl } from '../../config/api';
import { FileSpreadsheet, Users, Calculator, TrendingUp, BarChart, PieChart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Reports: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const token = localStorage.getItem('nxtwave_crm_token');
        const res = await fetch(getApiUrl('/api/reports'), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Reports & Analytics" subtitle="Operational metrics, registration growth and performance breakdown" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Operational Metrics (Section 11 Prompt Requirements) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Registrations"
            value={loading ? '...' : data?.metrics.totalRegistrations || 0}
            icon={FileSpreadsheet}
            color="blue"
            subtitle="Total student signups recorded"
          />
          <StatCard
            title="Total Ambassadors"
            value={loading ? '...' : data?.metrics.totalAmbassadors || 0}
            icon={Users}
            color="emerald"
            subtitle="Active referral program partners"
          />
          <StatCard
            title="Avg Regs / Ambassador"
            value={loading ? '...' : data?.metrics.avgRegistrationsPerAmbassador || 0}
            icon={Calculator}
            color="purple"
            subtitle="Mean conversion per ambassador"
          />
          <StatCard
            title="Registration Growth"
            value={loading ? '...' : `+${data?.metrics.growthRate || 0}%`}
            icon={TrendingUp}
            color="indigo"
            subtitle="Month-over-Month referral growth"
          />
        </div>

        {/* 3 Main Operational Charts (Section 11 Prompt Requirements) */}
        <div className="space-y-6">
          {/* Chart 1: Registrations over time */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>1. Registrations Over Time</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Daily registration timeline tracking</p>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.charts.overTime || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#timeGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 2: Registrations by Ambassador */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-indigo-600" />
                  <span>2. Registrations by Ambassador</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Top 10 performing ambassadors</p>
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={data?.charts.byAmbassador || []} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="ambassador_name" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 10 }} angle={-25} textAnchor="end" />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }} />
                      <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 3: Registrations by College */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                  <span>3. Registrations by College</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Top colleges producing student registrations</p>
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={data?.charts.byCollege || []} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="college" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 10 }} angle={-25} textAnchor="end" />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }} />
                      <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
