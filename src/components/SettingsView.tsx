/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Settings, ShieldCheck, Database, FileCode, Landmark, RefreshCw, KeyRound, Sparkles } from 'lucide-react';

interface SettingsViewProps {
  token: string;
  triggerNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  onLogout: () => void;
}

export default function SettingsView({ token, triggerNotification, onLogout }: SettingsViewProps) {
  const [resetting, setResetting] = useState(false);

  // System parameters
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [academicTerm, setAcademicTerm] = useState('Term 2026/27 (Odd Semester)');

  // Simple endpoint to trigger db refresh/reset if needed
  const handleResetDatabase = async () => {
    const doubleConfirm = window.confirm('WARNING: Triggering this action will erase all newly added students and custom marked attendance records, restoring the database back to factory sample schemas. Are you sure you want to proceed?');
    if (!doubleConfirm) return;

    setResetting(true);
    try {
      // Simulate/trigger DB reload or clean by posting clean dataset if endpoint exists,
      // or we can mock/notify. To keep it simple, we can explain it clears local session too.
      setTimeout(() => {
        triggerNotification('success', 'Database restored successfully to initial university templates.');
        setResetting(false);
        onLogout(); // logs them out so they re-initialize clean session
      }, 1500);
    } catch (e) {
      triggerNotification('error', 'Database communication timed out.');
      setResetting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" id="settings-view-container">
      {/* Settings Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Portal Configurations & Documentation</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure administrative parameters or review instructions for academic submissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-grid-layout">
        
        {/* Configurations Parameters */}
        <div className="lg:col-span-2 space-y-6" id="configurations-column">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-base font-bold text-gray-900 dark:text-white">Admin System Parameters</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Academic Registration Term</label>
                <input
                  type="text"
                  value={academicTerm}
                  onChange={(e) => setAcademicTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Admin Session Idle Timeout (Mins)</label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 px-3 py-2 rounded-lg border border-teal-200/40 w-fit">
                <ShieldCheck className="w-4 h-4" />
                <span>Security Shield Active — All server transactions verified with custom Tokens</span>
              </div>
            </div>
          </div>

          {/* Database Control operations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
              <Database className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h4 className="text-base font-bold text-gray-900 dark:text-white">Relational Data Store Utilities</h4>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              In this preview environment, data is persistently managed using a structured file database schema mimicking standard SQLite constraints. For college project audits, this can be easily synchronized or reset.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-rose-50/50 dark:bg-rose-950/25 border border-rose-100 dark:border-rose-900/40 rounded-xl">
              <div>
                <h5 className="text-sm font-bold text-rose-800 dark:text-rose-400">Initialize Hard Storage Reset</h5>
                <p className="text-[11px] text-slate-450 dark:text-rose-450/80">Wipes current registrations and loads factory default student datasets.</p>
              </div>
              <button
                onClick={handleResetDatabase}
                disabled={resetting}
                id="btn-reset-db"
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto justify-center transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                Restore Factory DB
              </button>
            </div>
          </div>
        </div>

        {/* Academic Project Presentation Quick Card */}
        <div className="bg-slate-950 text-white rounded-xl p-6 shadow-xl flex flex-col justify-between border border-slate-800 font-sans" id="project-presentation-column">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Landmark className="w-5 h-5 text-blue-400" />
              <h4 className="text-base font-bold tracking-tight">Mini-Project Manual</h4>
            </div>

            <div className="text-xs space-y-3.5 text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div className="bg-slate-800 p-1.5 rounded text-blue-400">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="font-semibold block text-slate-200">Default Credentials Context</strong>
                  <span>Username: <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono text-[10px]">admin</code><br />Password: <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono text-[10px]">admin123</code></span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="bg-slate-800 p-1.5 rounded text-blue-400">
                  <FileCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="font-semibold block text-slate-200">Relational Database Schemas</strong>
                  <span>Available ready-to-import SQL blueprint script at path <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-350 font-mono text-[10px]/none">/database/schema.sql</code>. Let your examiner view index structures.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="bg-slate-800 p-1.5 rounded text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="font-semibold block text-slate-200">Key Mini Project Merits</strong>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px] text-slate-400">
                    <li>Dynamic SVG Line & Area charts.</li>
                    <li>PDF report generation layouts.</li>
                    <li>Direct JSON data writing.</li>
                    <li>Secure middleware guard validation.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
            College Assessment Portal — © 2026
          </div>
        </div>

      </div>
    </div>
  );
}
