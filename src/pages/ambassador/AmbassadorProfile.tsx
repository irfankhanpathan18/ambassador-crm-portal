import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { Toast } from '../../components/Toast';
import { UserCheck, Mail, Building2, Tag, Copy, Check, Shield } from 'lucide-react';

export const AmbassadorProfile: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const referralLink = `${window.location.origin}/register?ref=${user?.ambassador?.referral_code || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setToastMessage('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="My Profile" subtitle="Your NxtWave Ambassador account details and referral credentials" />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <main className="p-6 max-w-4xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-8 text-white relative">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/30">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{user?.name}</h2>
                <p className="text-xs text-blue-200 font-medium mt-0.5">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Account Status: {user?.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Associated College</span>
              </p>
              <p className="font-bold text-slate-900 text-sm">{user?.ambassador?.college || 'N/A'}</p>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
              <p className="text-blue-600 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Unique Referral Code</span>
              </p>
              <p className="font-mono font-black text-blue-700 text-lg">
                {user?.ambassador?.referral_code || 'N/A'}
              </p>
            </div>

            <div className="md:col-span-2 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <p className="text-slate-600 font-bold text-xs">Your Public Student Registration Link</p>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-xs text-blue-700">
                <span className="truncate flex-1 font-bold">{referralLink}</span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
