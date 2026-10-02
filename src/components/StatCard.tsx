import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'indigo' | 'emerald' | 'purple' | 'amber';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600',
      border: 'border-blue-100',
      gradient: 'from-blue-600 to-indigo-600',
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      gradient: 'from-indigo-600 to-violet-600',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      gradient: 'from-emerald-600 to-teal-600',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-600',
      border: 'border-purple-100',
      gradient: 'from-purple-600 to-pink-600',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      border: 'border-amber-100',
      gradient: 'from-amber-600 to-orange-600',
    },
  };

  const scheme = colorMap[color];

  return (
    <div className={`bg-white p-6 rounded-2xl border ${scheme.border} shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-xl ${scheme.bg} ${scheme.text} transition-transform group-hover:scale-110 duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.gradient}`} />
    </div>
  );
};
