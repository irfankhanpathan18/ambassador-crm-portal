import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldAlert, Award } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'AMBASSADOR' && user.ambassador && (
          <div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-700">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Code: <strong className="font-bold text-blue-900">{user.ambassador.referral_code}</strong></span>
          </div>
        )}

        <div className="flex items-center gap-3 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-xs">
            <span className="font-semibold text-slate-800 block leading-none">{user?.name}</span>
            <span className="text-[10px] text-slate-500 font-medium capitalize">{user?.role?.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
