import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
  GraduationCap
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/ambassadors', label: 'Ambassadors', icon: Users },
    { to: '/admin/registrations', label: 'Registrations', icon: FileSpreadsheet },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const ambassadorLinks = [
    { to: '/ambassador/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ambassador/registrations', label: 'My Registrations', icon: FileSpreadsheet },
    { to: '/ambassador/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/ambassador/profile', label: 'My Profile', icon: UserCheck },
  ];

  const links = isAdmin ? adminLinks : ambassadorLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between shadow-xl flex-shrink-0 border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
            N
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">NxtWave</h1>
            <p className="text-xs text-blue-400 font-medium">Ambassador CRM</p>
          </div>
        </div>

        {/* User Role Card */}
        <div className="mx-4 my-4 p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isAdmin ? 'ADMIN' : 'AMBASSADOR'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <Link
          to="/register"
          className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/50 transition-colors"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Public Registration Form</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
