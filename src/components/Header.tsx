/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Moon, Sun, Clock, Calendar, CheckCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

export default function Header({ activeTab, darkMode, setDarkMode }: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'System Dashboard';
      case 'students':
        return 'Student Records Management';
      case 'attendance':
        return 'Mark Attendance Sheet';
      case 'reports':
        return 'Academic Performance & Reports';
      case 'settings':
        return 'Global System Settings';
      default:
        return 'Attendance System';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 h-16 flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-200 shadow-sm">
      {/* Title & Path */}
      <div>
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">Faculty Admin Desk</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{getPageTitle()}</h2>
      </div>

      {/* Date-Time & Toggles */}
      <div className="flex items-center gap-6">
        {/* Dynamic Clock Indicator */}
        <div className="hidden md:flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800/80 px-4 py-1.5 rounded-full text-xs text-gray-650 dark:text-slate-350">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">{formatDate(time)}</span>
          </div>
          <div className="h-3 w-[1px] bg-gray-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono">{formatTime(time)}</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-900/30">
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="font-semibold tracking-wide uppercase text-[10px]">Database Connected</span>
        </div>

        {/* Dark/Light Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          id="toggle-darkmode"
          className="p-2.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-300 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-750 transition-all cursor-pointer"
          title={darkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode'}
        >
          {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>
      </div>
    </header>
  );
}
