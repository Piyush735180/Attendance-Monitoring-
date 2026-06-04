/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, Lock, User, ShieldAlert, Sparkles, RefreshCcw } from 'lucide-react';
import { Notification } from './types';

// Component imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NotificationToast from './components/NotificationToast';
import DashboardView from './components/DashboardView';
import StudentView from './components/StudentView';
import AttendanceView from './components/AttendanceView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('ams_admin_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Login form status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Apply visual theme transitions
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Alert Manager dispatching
  const triggerNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
    
    // Auto purge alerts in 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Perform secure login transaction
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!username.trim() || !password.trim()) {
      setLoginError('Please fill in both credential fields.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('ams_admin_token', data.token);
        setToken(data.token);
        triggerNotification('success', 'Authentication validated! Welcome to EduAttendance portal.');
      } else {
        const err = await res.json();
        setLoginError(err.error || 'Invalid credentials. Use admin / admin123.');
      }
    } catch (err) {
      setLoginError('Server communication failed. Please check backend.');
    } finally {
      setLoginLoading(false);
    }
  };

  // End active academic session
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('ams_admin_token');
    setToken(null);
    triggerNotification('info', 'Active session terminated securely. Goodbye!');
  };

  // Switch context renderers
  const renderTabContent = () => {
    if (!token) return null;
    
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView token={token} triggerNotification={triggerNotification} />;
      case 'students':
        return <StudentView token={token} triggerNotification={triggerNotification} />;
      case 'attendance':
        return <AttendanceView token={token} triggerNotification={triggerNotification} />;
      case 'reports':
        return <ReportsView token={token} triggerNotification={triggerNotification} />;
      case 'settings':
        return <SettingsView token={token} triggerNotification={triggerNotification} onLogout={handleLogout} />;
      default:
        return <DashboardView token={token} triggerNotification={triggerNotification} />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200`}>
      {/* Dynamic Alerts */}
      <NotificationToast notifications={notifications} onDismiss={handleDismissNotification} />

      <AnimatePresence mode="wait">
        {!token ? (
          /* Stately Academic Login viewport */
          <motion.div
            key="login-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/40 relative overflow-hidden"
            id="login-page"
          >
            {/* Blue background blur nodes */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 max-w-md w-full rounded-2xl shadow-2xl p-8 z-10 space-y-6 relative">
              
              {/* College Branding logo header */}
              <div className="text-center space-y-2">
                <div className="mx-auto bg-blue-600 dark:bg-blue-600/90 text-white p-3.5 rounded-2xl w-fit shadow-lg shadow-blue-500/20">
                  <Landmark className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">EduAttendance System</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">B.Tech / BCA Mini-Project Assessment Portal</p>
                </div>
              </div>

              {/* Login Credentials alert box */}
              {loginError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-750 dark:text-rose-450 rounded-lg text-xs font-semibold flex items-start gap-2 animate-shake" id="login-error-alert">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Secure Entry Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Administrator Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 dark:hover:border-slate-700 transition"
                    id="input-username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 dark:hover:border-slate-700 transition"
                    id="input-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-sm shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
                  id="btn-login-submit"
                >
                  {loginLoading ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Verify Security & Log In</span>
                  )}
                </button>
              </form>

              {/* Developer Tip footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 justify-center text-[10px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Default credentials: <code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded font-mono text-blue-650 dark:text-blue-400">admin</code> & <code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded font-mono text-blue-650 dark:text-blue-400">admin123</code></span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Stately Central Console desktop view */
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-screen text-slate-800 dark:text-slate-250 select-none"
            id="portal-console"
          >
            {/* Navigation Layout */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950/40">
              <Header activeTab={activeTab} darkMode={darkMode} setDarkMode={setDarkMode} />

              <main className="flex-1 overflow-y-auto no-print">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </main>

              {/* Quick display support for print layouts */}
              <div className="hidden print:block">
                {renderTabContent()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
