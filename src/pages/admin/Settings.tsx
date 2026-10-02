import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Toast } from '../../components/Toast';
import { Settings as SettingsIcon, Database, ShieldCheck, RefreshCw, Info } from 'lucide-react';

export const Settings: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Settings & Overview" subtitle="System configuration and operational overview" />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Configuration</h2>
              <p className="text-xs text-slate-500 font-medium">NxtWave Ambassador CRM — Prototype Settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Database Status</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Relational Database (SQLite) initialized with <strong>users</strong>, <strong>ambassadors</strong>, and <strong>registrations</strong> entities with foreign keys and performance indexes.
              </p>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-md">
                Connected & Indexed
              </span>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Security & Authorization</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                JWT bearer authentication enabled. API endpoints enforce strict role authorization (ADMIN vs AMBASSADOR).
              </p>
              <span className="inline-block bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-1 rounded-md">
                RBAC Enforced
              </span>
            </div>
          </div>

          <div className="p-5 bg-blue-50/50 border border-blue-200/60 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900">Demo Notes for Assignment Presentation:</p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600">
                <li>Registrations are stored permanently upon student form submission.</li>
                <li>There are NO pending/approved/rejected registration statuses in this CRM.</li>
                <li>Ambassador status controls account access (Active / Inactive).</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
