import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { LeaderboardItem } from '../../types';
import { Trophy, Medal, Award } from 'lucide-react';

export const AmbassadorLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const token = localStorage.getItem('nxtwave_crm_token');
        const res = await fetch(`/api/leaderboard?period=${period}`, {
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

  const myRankItem = leaderboard.find(item => item.referral_code === user?.ambassador?.referral_code);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Leaderboard" subtitle="See how you rank among all NxtWave student ambassadors" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* My Rank Highlight Banner */}
        {myRankItem && (
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl border border-white/30">
                #{myRankItem.rank}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Your Current Rank</p>
                <h3 className="text-xl font-extrabold text-white">{myRankItem.ambassador_name}</h3>
                <p className="text-xs text-blue-100 mt-0.5">{myRankItem.college}</p>
              </div>
            </div>

            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20 text-center">
              <span className="text-2xl font-black text-cyan-300 block">{myRankItem.total_registrations}</span>
              <span className="text-xs text-blue-100 font-medium">Total Registrations</span>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Leaderboard Rankings</span>
          </h3>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'month', 'week'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === 'all' ? 'All Time' : p === 'month' ? 'This Month' : 'This Week'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading rankings...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6 text-center w-20">Rank</th>
                    <th className="py-3.5 px-6">Ambassador</th>
                    <th className="py-3.5 px-6">College</th>
                    <th className="py-3.5 px-6 text-right">Total Registrations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {leaderboard.map((item) => {
                    const isMe = item.referral_code === user?.ambassador?.referral_code;
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isMe
                            ? 'bg-blue-50/90 font-bold border-l-4 border-blue-600'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-4 px-6 text-center font-bold">
                          {item.rank === 1 && <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black inline-flex items-center justify-center">1</span>}
                          {item.rank === 2 && <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black inline-flex items-center justify-center">2</span>}
                          {item.rank === 3 && <span className="w-7 h-7 rounded-full bg-amber-600/30 text-amber-900 font-black inline-flex items-center justify-center">3</span>}
                          {item.rank > 3 && <span className="text-slate-500 font-bold">#{item.rank}</span>}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {item.ambassador_name} {isMe && <span className="text-blue-600 text-[10px] uppercase ml-1.5 font-black bg-blue-100 px-2 py-0.5 rounded-full">(You)</span>}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-700">{item.college}</td>
                        <td className="py-4 px-6 text-right font-black text-blue-600 text-sm">
                          {item.total_registrations}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
