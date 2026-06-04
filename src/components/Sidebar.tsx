/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Users, CalendarCheck, FileBarChart2, Settings, Landmark, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
    { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart2 },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shadow-xl border-r border-slate-800 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight leading-tight">EduAttendance</h1>
          <span className="text-xs text-blue-400 font-medium">Academic Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
              id={`nav-item-${item.id}`}
            >
              <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-105 duration-100 ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
              }`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Admin Profile Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
            AD
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <h4 className="text-xs font-semibold text-slate-200 truncate">Administrator Staff</h4>
            <span className="text-[10px] text-slate-500 block truncate">admin@eduportal.ac.in</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          id="btn-logout"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-800 hover:border-rose-900 hover:bg-rose-950/20 text-xs font-medium text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out Session
        </button>
      </div>
    </aside>
  );
}
