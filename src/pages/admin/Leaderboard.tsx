import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { LeaderboardItem } from '../../types';
import { getApiUrl } from '../../config/api';
import { Trophy, Medal, Award, Flame } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const token = localStorage.getItem('nxtwave_crm_token');
        const res = await fetch(getApiUrl(`/api/leaderboard?period=${period}`), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [period]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Ambassador Leaderboard" subtitle="Rankings based on total student registrations driven by ambassadors" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Control Bar with Timeframe Tabs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Performance Leaderboard</h2>
              <p className="text-xs text-slate-500 font-medium">Calculated dynamically from live registration data</p>
            </div>
          </div>

          {/* Period Filter Tabs (Section 10 Requirement) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {(
              [
                { id: 'all', label: 'All Time' },
                { id: 'month', label: 'This Month' },
                { id: 'week', label: 'This Week' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  period === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium Highlight Cards (Top 3) */}
        {!loading && leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Rank 2 (Silver) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden order-2 md:order-1">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-lg border-2 border-slate-300 mb-3 shadow-md">
                2
              </div>
              <p className="text-sm font-black text-slate-900">{leaderboard[1].ambassador_name}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{leaderboard[1].college}</p>
              <span className="inline-block mt-2 font-mono text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {leaderboard[1].referral_code}
              </span>
              <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                <span className="text-2xl font-black text-slate-900">{leaderboard[1].total_registrations}</span>
                <span className="text-xs text-slate-400 font-semibold block">Registrations</span>
              </div>
            </div>

            {/* Rank 1 (Gold) */}
            <div className="bg-gradient-to-b from-amber-50 to-white p-6 rounded-2xl border-2 border-amber-300 shadow-lg flex flex-col items-center text-center relative overflow-hidden order-1 md:order-2 transform md:-translate-y-2">
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-xs">
                Champion
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl border-4 border-amber-200 mb-3 shadow-lg shadow-amber-400/30">
                1
              </div>
              <p className="text-base font-black text-slate-900">{leaderboard[0].ambassador_name}</p>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{leaderboard[0].college}</p>
              <span className="inline-block mt-2 font-mono text-[11px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded">
                {leaderboard[0].referral_code}
              </span>
              <div className="mt-4 pt-4 border-t border-amber-200/60 w-full">
                <span className="text-3xl font-black text-amber-600">{leaderboard[0].total_registrations}</span>
                <span className="text-xs text-amber-700 font-bold block">Registrations</span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden order-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg border-2 border-amber-300 mb-3 shadow-md">
                3
              </div>
              <p className="text-sm font-black text-slate-900">{leaderboard[2].ambassador_name}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{leaderboard[2].college}</p>
              <span className="inline-block mt-2 font-mono text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {leaderboard[2].referral_code}
              </span>
              <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                <span className="text-2xl font-black text-slate-900">{leaderboard[2].total_registrations}</span>
                <span className="text-xs text-slate-400 font-semibold block">Registrations</span>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Calculating dynamic leaderboard statistics...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6 text-center w-20">Rank</th>
                    <th className="py-3.5 px-6">Ambassador</th>
                    <th className="py-3.5 px-6">College</th>
                    <th className="py-3.5 px-6">Referral Code</th>
                    <th className="py-3.5 px-6 text-right">Total Registrations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {leaderboard.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.rank <= 3 ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-center font-bold">
                        <div className="inline-flex items-center justify-center">
                          {item.rank === 1 && <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center">1</span>}
                          {item.rank === 2 && <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center">2</span>}
                          {item.rank === 3 && <span className="w-7 h-7 rounded-full bg-amber-600/30 text-amber-900 font-black flex items-center justify-center">3</span>}
                          {item.rank > 3 && <span className="text-slate-500 font-bold">#{item.rank}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {item.ambassador_name}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">
                        {item.college}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                          {item.referral_code}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-base font-black text-blue-600">
                          {item.total_registrations}
                        </span>
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
