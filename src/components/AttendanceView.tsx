/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Calendar, Layers, RefreshCcw, Check, Save, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface AttendanceViewProps {
  token: string;
  triggerNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface AttendanceSheetRow {
  student_id: string;
  name: string;
  roll_number: string;
  class: string;
  section: string;
  email: string;
  contact: string;
  status: 'Present' | 'Absent' | '';
}

export default function AttendanceView({ token, triggerNotification }: AttendanceViewProps) {
  const [selectedClass, setSelectedClass] = useState('B.Tech CSE');
  const [selectedDate, setSelectedDate] = useState('2026-06-04'); // default synced with db.json mock active dates
  
  const [sheet, setSheet] = useState<AttendanceSheetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch student roll sheet matching class and date context
  const fetchAttendanceSheet = async () => {
    if (!selectedClass || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/sheet?class=${encodeURIComponent(selectedClass)}&date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setSheet(data);
      } else {
        triggerNotification('error', 'Failed to retrieve attendance sheet.');
      }
    } catch (e) {
      triggerNotification('error', 'Network communication error while loading rosters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceSheet();
  }, [selectedClass, selectedDate]);

  // Adjust specific student attendance status
  const toggleStatus = (studentId: string, status: 'Present' | 'Absent') => {
    setSheet((prevSheet) =>
      prevSheet.map((row) =>
        row.student_id === studentId ? { ...row, status } : row
      )
    );
  };

  // Mass updater for admin convenience
  const markAll = (status: 'Present' | 'Absent') => {
    setSheet((prevSheet) =>
      prevSheet.map((row) => ({ ...row, status }))
    );
    triggerNotification('info', `Marked all students as '${status}' on this sheet.`);
  };

  // Save changes to backend database
  const handleSave = async () => {
    const unmarkedCount = sheet.filter((s) => !s.status).length;
    if (unmarkedCount > 0) {
      const confirmSave = window.confirm(`There are ${unmarkedCount} students unmarked. Proceed with saving anyway? (Unmarked rows will not be written to database)`);
      if (!confirmSave) return;
    }

    setSaving(true);
    try {
      // Assemble records
      const records = sheet
        .filter((row) => row.status === 'Present' || row.status === 'Absent')
        .map((row) => ({
          student_id: row.student_id,
          status: row.status
        }));

      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          records
        })
      });

      if (res.ok) {
        triggerNotification('success', `Attendance compiled and saved successfully for date ${selectedDate}!`);
        fetchAttendanceSheet(); // reload state from updated database
      } else {
        const err = await res.json();
        triggerNotification('error', err.error || 'Failed to submit attendance roster.');
      }
    } catch (e) {
      triggerNotification('error', 'Network failure during record submission.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = sheet.some((s) => s.status);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" id="attendance-view-container">
      {/* View Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Daily Attendance Marking</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Select lecture class, schedule date context, and mark roll call values securely.</p>
      </div>

      {/* Roster Controls Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-end" id="roster-controllers">
        {/* Class Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Select Lecture Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            id="attendance-class-select"
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="B.Tech CSE">B.Tech CSE (Computer Science)</option>
            <option value="BCA">BCA (Bachelor of Comp Applications)</option>
            <option value="B.Tech IT">B.Tech IT (Information Technology)</option>
          </select>
        </div>

        {/* Date Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Attendance Calendar Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            id="attendance-date-select"
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Mass update utilities */}
        <div className="flex gap-3 h-[42px]">
          <button
            onClick={() => markAll('Present')}
            disabled={sheet.length === 0 || loading}
            id="btn-mark-all-present"
            className="flex-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 rounded-lg text-xs transition disabled:opacity-40 cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll('Absent')}
            disabled={sheet.length === 0 || loading}
            id="btn-mark-all-absent"
            className="flex-1 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-450 font-bold hover:bg-rose-100/50 dark:hover:bg-rose-950/40 rounded-lg text-xs transition disabled:opacity-40 cursor-pointer"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Attendance marking workspace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden" id="roster-workspace">
        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Class Roster for '{selectedClass}'</span>
          </div>
          {hasChanges && (
            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded uppercase">Unsaved Changes pending</span>
          )}
        </div>

        <div>
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center gap-3">
              <RefreshCcw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading student rosters...</span>
            </div>
          ) : sheet.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              No students registered in {selectedClass}. Register students in Student Directory panel first.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-slate-800 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Roll</th>
                  <th className="py-3.5 px-6">Student Information</th>
                  <th className="py-3.5 px-6">Class Division</th>
                  <th className="py-3.5 px-6 text-center">Roster Status Selection</th>
                </tr>
              </thead>
              <tbody>
                {sheet.map((student) => (
                  <tr 
                    key={student.student_id} 
                    className="border-b border-slate-50 dark:border-slate-850/40 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      #{student.roll_number}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-850 dark:text-slate-250">{student.name}</div>
                      <div className="text-[11px] text-slate-450 dark:text-slate-500 font-mono">{student.student_id} | {student.email}</div>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-650 dark:text-slate-400">
                      Sec {student.section}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center gap-2">
                        {/* Present Button option */}
                        <button
                          onClick={() => toggleStatus(student.student_id, 'Present')}
                          className={`flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
                            student.status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-400'
                          }`}
                          id={`btn-present-${student.student_id}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Present
                        </button>

                        {/* Absent Button option */}
                        <button
                          onClick={() => toggleStatus(student.student_id, 'Absent')}
                          className={`flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
                            student.status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/10'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-400'
                          }`}
                          id={`btn-absent-${student.student_id}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Absent
                        </button>

                        {/* Status visual checklist indicator */}
                        {student.status ? (
                          student.status === 'Present' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 ml-2" />
                          )
                        ) : (
                          <div className="w-4 h-4 bg-slate-100 dark:bg-slate-850 rounded-full ml-2 border border-dashed border-slate-300 dark:border-slate-800" title="Unmarked" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Action Commit Bar */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={fetchAttendanceSheet}
            disabled={loading}
            className="px-5 py-2.5 text-sm text-slate-650 hover:text-slate-950 hover:bg-slate-150/40 dark:hover:bg-slate-850 dark:text-slate-450 dark:hover:text-slate-200 rounded-lg transition"
          >
            Reset Sheet
          </button>
          <button
            onClick={handleSave}
            disabled={sheet.length === 0 || loading || saving}
            id="btn-save-attendance"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/15 group disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            Save Attendance Records
          </button>
        </div>
      </div>
    </div>
  );
}
