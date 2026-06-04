/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Percent, TrendingUp, Sparkles, RefreshCcw, CalendarSync } from 'lucide-react';
import { DashboardStats } from '../types';

interface DashboardViewProps {
  token: string;
  triggerNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function DashboardView({ token, triggerNotification }: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        triggerNotification('error', 'Failed to retrieve dashboard analytics');
      }
    } catch (e) {
      triggerNotification('error', 'Network error connecting to administration server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 gap-3" id="dashboard-loading">
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Compiling statistics...</span>
      </div>
    );
  }

  if (!stats) return null;

  // Render variables for safe mathematical formulas
  const totalStuds = stats.totalStudents;
  const presToday = stats.presentToday;
  const absToday = stats.absentToday;
  const attendPct = stats.attendancePercentage;

  // Let's create beautiful SVG path parameters for the Attendance Trend Chart
  const trendData = stats.weeklyTrend;
  const padding = 40;
  const chartWidth = 500;
  const chartHeight = 180;
  const svgWidth = chartWidth + padding * 2;
  const svgHeight = chartHeight + padding * 2;

  // Find points
  const points = trendData.map((d, index) => {
    const x = padding + (index * (chartWidth / (trendData.length - 1 || 1)));
    const y = padding + (chartHeight - (d.rate / 100) * chartHeight);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`
    : '';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto" id="dashboard-container">
      {/* Quick Context Tip */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
          </span>
          <div className="text-sm text-slate-800 dark:text-slate-350">
            Welcome to <strong className="font-semibold text-blue-600 dark:text-blue-400">EduAttendance</strong>. Active date context is set to <strong className="font-semibold">June 4, 2026</strong>. Add students and check today's sheets matching your scheduled lecture hours.
          </div>
        </div>
        <button 
          onClick={fetchStats}
          id="btn-sync-stats"
          className="flex items-center gap-1 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-750 transition shadow-sm cursor-pointer"
        >
          <CalendarSync className="w-3.5 h-3.5" />
          Sync
        </button>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-cards-grid">
        {/* Card 1: Total Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden" id="card-total-students">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">Total Enrolled</span>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{totalStuds}</h3>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-slate-800 text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500">
            <span className="font-semibold text-blue-600 dark:text-blue-400">All Semesters</span>
            <span>registered in records</span>
          </div>
        </div>

        {/* Card 2: Present Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden" id="card-present-today">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">Present Today</span>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{presToday}</h3>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500">
            <span className="font-semibold text-emerald-650 dark:text-emerald-400">Active Attendee</span>
            <span>marked on June 4</span>
          </div>
        </div>

        {/* Card 3: Absent Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden" id="card-absent-today">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">Absent Today</span>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{absToday}</h3>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-100 dark:border-slate-800 text-rose-600 dark:text-rose-450">
              <UserX className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500">
            <span className="font-semibold text-rose-650 dark:text-rose-400">Leave / Unexcused</span>
            <span>unmarked rate tracker</span>
          </div>
        </div>

        {/* Card 4: Attendance Percentage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden" id="card-attendance-percentage">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">Overall Ratio</span>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{attendPct}%</h3>
            </div>
            <div className="bg-violet-50 dark:bg-violet-950/40 p-3 rounded-xl border border-violet-100 dark:border-slate-800 text-violet-600 dark:text-violet-400">
              <Percent className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500">
            <span className="font-semibold text-violet-600 dark:text-violet-400">Avg Target: 75%</span>
            <span>academic compliance</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Layout - Hand-crafted charts and progressive status grids */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="dashboard-visual-analytics">
        {/* Analytics Charts Area */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between" id="chart-trending-history">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Attendance Analytics Trend</h3>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded uppercase">Historical 5 Days</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-2">
              Weekly progress line mapping average daily present ratios across semesters. Essential for B.Tech/BCA aggregate evaluation.
            </p>
          </div>

          {/* Core SVG Chart Implementation avoiding type breaks */}
          <div className="relative w-full overflow-x-auto select-none mt-2 flex justify-center">
            {stats.weeklyTrend.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400">No historic trend data loaded. Use the Mark Attendance view to add historical entries.</div>
            ) : (
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full max-w-lg overflow-visible font-sans"
              >
                {/* Grayscale grid lines */}
                {[0, 25, 50, 75, 100].map((level) => {
                  const y = padding + chartHeight - (level / 100) * chartHeight;
                  return (
                    <g key={level}>
                      <line 
                        x1={padding} 
                        y1={y} 
                        x2={padding + chartWidth} 
                        y2={y} 
                        stroke="gray" 
                        strokeWidth="1" 
                        strokeDasharray="4 4"
                        className="opacity-20 dark:opacity-10"
                      />
                      <text 
                        x={padding - 8} 
                        y={y + 4} 
                        textAnchor="end" 
                        className="text-[10px] fill-slate-400 dark:fill-slate-550 font-mono font-medium"
                      >
                        {level}%
                      </text>
                    </g>
                  );
                })}

                {/* AREA Gradient fill for aesthetic style */}
                <defs>
                  <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#gradient-area)" />

                {/* Line Path */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dot coordinates and interactive points */}
                {points.map((p, i) => (
                  <g key={i} className="group/dot cursor-pointer">
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="5" 
                      fill="#ffffff" 
                      stroke="#2563eb" 
                      strokeWidth="3.5"
                    />
                    <text 
                      x={p.x} 
                      y={p.y - 12} 
                      textAnchor="middle" 
                      className="text-[11px] font-bold fill-blue-650 dark:fill-blue-400 opacity-0 group-hover/dot:opacity-100 transition duration-150 font-mono bg-white"
                    >
                      {p.rate}%
                    </text>
                    {/* Date labels at bottom */}
                    <text 
                      x={p.x} 
                      y={chartHeight + padding + 18} 
                      textAnchor="middle" 
                      className="text-[10px] p-2 fill-slate-500 dark:fill-slate-400 font-medium font-mono"
                    >
                      {p.date.split('-').slice(1).join('/')}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* Dynamic Class-wise distribution status */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between" id="distribution-meters">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Class Statistics</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Department-wise student attendance metrics showing current compliance status.
            </p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {stats.classwiseStats.map((cls, ind) => {
              // Custom bar color style
              let progressColor = 'bg-blue-600';
              if (cls.percentage < 60) progressColor = 'bg-rose-500';
              else if (cls.percentage < 75) progressColor = 'bg-amber-500';
              else progressColor = 'bg-emerald-500';

              return (
                <div key={ind} className="space-y-1" id={`cls-bar-${ind}`}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="truncate pr-2">{cls.className}</span>
                    <span className="font-mono">{cls.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-850 h-2 px-0.5 py-0.5 rounded-full flex items-center">
                    <div 
                      className={`h-1.5 rounded-full ${progressColor} transition-all duration-500`}
                      style={{ width: `${cls.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-450 font-mono">
                    <span>{cls.present} present records</span>
                    <span>{cls.total} total days</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Board */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl p-6 shadow-sm" id="recent-activity-section">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Recent Attendance Activity</h3>
        <div className="overflow-x-auto">
          {stats.recentActivity.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No attendance activities logged. Select the Mark Attendance tab to submit reports.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Rank</th>
                  <th className="py-3 px-4">Academic Class</th>
                  <th className="py-3 px-4">Session Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((activity, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-slate-50 dark:border-slate-850/40 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-850 dark:text-slate-200">
                      {activity.studentName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      #{activity.rollNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {activity.class} - Sec {activity.section}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {activity.date}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold leading-none ${
                        activity.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${activity.status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
