/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Calendar, Users, FileBarChart2, Download, Printer, RefreshCcw, FileText, CheckCircle, XCircle, Search, Sparkles } from 'lucide-react';
import { Student } from '../types';

interface ReportsViewProps {
  token: string;
  triggerNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

type ReportType = 'daily' | 'student' | 'monthly';

export default function ReportsView({ token, triggerNotification }: ReportsViewProps) {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [loading, setLoading] = useState(false);

  // Filter criteria states
  const [selectedClass, setSelectedClass] = useState('B.Tech CSE');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-06-04');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-06'); // format YYYY-MM
  
  // Auxiliary states
  const [students, setStudents] = useState<Student[]>([]);
  const [reportData, setReportData] = useState<any>(null);

  // Load students directory for student-wise mapping selection
  useEffect(() => {
    const fetchStudentsForFilter = async () => {
      try {
        const res = await fetch('/api/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
          if (data.length > 0 && !selectedStudentId) {
            setSelectedStudentId(data[0].student_id);
          }
        }
      } catch (e) {
        console.error('Failed Loading filter values');
      }
    };
    fetchStudentsForFilter();
  }, [token]);

  // Fetch report data on parameters change
  const fetchReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      let endpoint = '';
      if (reportType === 'daily') {
        endpoint = `/api/reports/daily?date=${selectedDate}`;
      } else if (reportType === 'student') {
        endpoint = `/api/reports/student?student_id=${selectedStudentId}`;
      } else {
        endpoint = `/api/reports/monthly?class=${encodeURIComponent(selectedClass)}&section=${selectedSection}&month=${selectedMonth}`;
      }

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        triggerNotification('error', 'Unable to calculate report data.');
      }
    } catch (e) {
      triggerNotification('error', 'Communication failure in report compiler.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedClass, selectedSection, selectedDate, selectedStudentId, selectedMonth]);

  // Client-Side CSV Export Engine
  const handleExportCSV = () => {
    if (!reportData || (Array.isArray(reportData) && reportData.length === 0)) {
      triggerNotification('error', 'No active data available for export.');
      return;
    }

    let csvContent = '';
    let fileName = '';

    if (reportType === 'daily') {
      fileName = `Daily_Report_${selectedDate}.csv`;
      const headers = ['Student ID', 'Name', 'Roll Number', 'Class', 'Section', 'Status'];
      const rows = reportData.map((row: any) => [
        row.student_id,
        row.name,
        row.roll_number,
        row.class,
        row.section,
        row.status
      ]);
      csvContent = [headers.join(','), ...rows.map((r: any) => r.map((cell: string) => `"${cell}"`).join(','))].join('\n');
    } else if (reportType === 'student') {
      const details = reportData.studentDetails;
      fileName = `Student_Wise_Report_${details?.student_id || 'ID'}.csv`;
      const headers = ['Date', 'Status'];
      const rows = (reportData.history || []).map((row: any) => [row.date, row.status]);
      
      csvContent = [
        `"Student Details:","${details?.name} (${details?.student_id})","Class:","${details?.class} - Sec ${details?.section}"`,
        '',
        headers.join(','),
        ...rows.map((r: any) => r.map((cell: string) => `"${cell}"`).join(','))
      ].join('\n');
    } else {
      fileName = `Agg_Report_${selectedClass}_${selectedMonth}.csv`;
      const headers = ['Student ID', 'Name', 'Roll Number', 'Class', 'Section', 'Present Days', 'Absent Days', 'Total Sessions', 'Attendance %'];
      const rows = reportData.map((row: any) => [
        row.student_id,
        row.name,
        row.roll_number,
        row.class,
        row.section,
        row.presentCount,
        row.absentCount,
        row.totalCount,
        `${row.percentage}%`
      ]);
      csvContent = [headers.join(','), ...rows.map((r: any) => r.map((cell: string) => `"${cell}"`).join(','))].join('\n');
    }

    // Anchor Trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerNotification('success', `Exported spreadsheet saved as '${fileName}'!`);
  };

  // High Fidelity Print Trigger (Bypasses UI sidebar using standard media styles)
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" id="reports-view-container">
      {/* Report Custom Styles for crisp media sheets */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, nav, button, select, input, .no-print {
            display: none !important;
          }
          .print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 30px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-header {
            display: flex !important;
            border-bottom: 2px solid #1e3a8a !important;
            padding-bottom: 15px !important;
            margin-bottom: 25px !important;
          }
        }
      `}</style>

      {/* Roster Type Selector Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print" id="reports-selector-row">
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              reportType === 'daily'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="tab-report-daily"
          >
            <Calendar className="w-4 h-4" />
            Daily Attendance Ledger
          </button>
          <button
            onClick={() => setReportType('student')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              reportType === 'student'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="tab-report-student"
          >
            <Users className="w-4 h-4" />
            Student-Wise Ledger
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              reportType === 'monthly'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            id="tab-report-monthly"
          >
            <FileBarChart2 className="w-4 h-4" />
            Class & Monthly Aggregate
          </button>
        </div>

        {/* Action sheets */}
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={loading || !reportData}
            id="btn-export-csv"
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 text-xs font-semibold shadow-sm transition disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrintPDF}
            disabled={loading || !reportData}
            id="btn-print-pdf"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition disabled:opacity-40 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Generate PDF Report
          </button>
        </div>
      </div>

      {/* Context-Specific Search Filter Panels */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-end no-print" id="reports-parameter-card">
        {reportType === 'daily' && (
          <div className="space-y-1.5 md:col-span-3 max-w-sm">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Select Report Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              id="report-date-input"
              className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {reportType === 'student' && (
          <div className="space-y-1.5 md:col-span-3 max-w-md">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Select Student roster</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              id="report-student-select"
              className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              {students.length === 0 ? (
                <option value="">No Students Enrolled</option>
              ) : (
                students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    [{s.student_id}] {s.name} - Roll #{s.roll_number}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {reportType === 'monthly' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Lecture Cohort Name</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                id="report-class-select"
                className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="B.Tech CSE">B.Tech CSE</option>
                <option value="BCA">BCA</option>
                <option value="B.Tech IT">B.Tech IT</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Division Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                id="report-section-select"
                className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Divisions</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Report Cal Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                id="report-month-input"
                className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-250 dark:border-slate-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Compiled Report Sheet Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-md p-8 print-area" id="compiled-report-render">
        
        {/* Printable Letterhead header */}
        <div className="hidden print-header flex justify-between items-center border-b-2 border-blue-900 pb-5 mb-6" id="printable-letterhead">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 text-white font-extrabold px-3 py-2 rounded text-xl">ED</div>
            <div>
              <h2 className="text-xl font-extrabold text-blue-900 uppercase">EduAttendance College Portal</h2>
              <span className="text-[10px] text-gray-500 tracking-wider">OFFICIAL ACADEMIC ATTENDANCE REGISTER - TERM 2026/27</span>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold text-gray-800">Classification: Standard Admin</p>
            <p className="text-gray-500">Render Date: {new Date().toLocaleDateString('en-US')}</p>
          </div>
        </div>

        {/* Informative summary tags on physical display */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100/30 text-blue-600 dark:text-blue-450">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-650 dark:text-blue-400 uppercase tracking-widest block">Active Report Overview</span>
              <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {reportType === 'daily' && `Daily Attendance Sheet — ${selectedDate}`}
                {reportType === 'student' && reportData?.studentDetails && `Consolidated Card — ${reportData.studentDetails.name}`}
                {reportType === 'monthly' && `Cohort Aggregate — Class ${selectedClass}`}
              </h4>
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            {reportType === 'daily' && reportData && (
              <>
                <div className="text-xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[9px] mb-0.5">Present</span>
                  <span className="font-bold text-emerald-600 font-mono text-base">{reportData.filter((r: any) => r.status === 'Present').length} students</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[9px] mb-0.5">Absent</span>
                  <span className="font-bold text-rose-600 font-mono text-base">{reportData.filter((r: any) => r.status === 'Absent').length} students</span>
                </div>
              </>
            )}

            {reportType === 'student' && reportData?.studentDetails && (
              <>
                <div className="text-xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[9px] mb-0.5">Cohort Course</span>
                  <span className="font-bold text-blue-600 dark:text-blue-450 text-base">{reportData.studentDetails.class} - {reportData.studentDetails.section}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[9px] mb-0.5">Avg Present</span>
                  <span className="font-bold text-emerald-650 font-mono text-base">
                    {reportData.history.length > 0 
                      ? `${Math.round((reportData.history.filter((h: any) => h.status === 'Present').length / reportData.history.length) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </>
            )}

            {reportType === 'monthly' && reportData && (
              <>
                <div className="text-xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[9px] mb-0.5">Roster Count</span>
                  <span className="font-bold text-blue-600 text-base">{reportData.length} students</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[9px] mb-0.5">Avg Cohort Attendance</span>
                  <span className="font-bold text-emerald-600 font-mono text-base animate-pulse">
                    {reportData.length > 0 
                      ? `${Math.round(reportData.reduce((acc: number, cur: any) => acc + cur.percentage, 0) / reportData.length)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Report Content Table */}
        <div className="mt-6">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center gap-3">
              <RefreshCcw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-sm font-semibold text-slate-500">Re-compiling report indexes...</span>
            </div>
          ) : !reportData || (Array.isArray(reportData) && reportData.length === 0) ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No matching records gathered for the chosen filters. Register attendance sheet dates first.
            </div>
          ) : (
            <>
              {/* Daily Report Format */}
              {reportType === 'daily' && Array.isArray(reportData) && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 text-left text-xs font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 uppercase tracking-widest leading-none">
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row: any) => (
                      <tr key={row.student_id} className="border-b border-gray-100 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{row.student_id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.name}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{row.roll_number}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-450">{row.class} - Sec {row.section}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                            row.status === 'Present' ? 'text-emerald-600 dark:text-emerald-400' : row.status === 'Absent' ? 'text-rose-600 dark:text-rose-450' : 'text-slate-400'
                          }`}>
                            {row.status === 'Present' && <CheckCircle className="w-3.5 h-3.5" />}
                            {row.status === 'Absent' && <XCircle className="w-3.5 h-3.5" />}
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Student-Wise Report Format */}
              {reportType === 'student' && reportData.studentDetails && (
                <div className="space-y-6">
                  {/* Student details top header */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-gray-150 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Student Name</span>
                      <p className="text-sm font-bold text-slate-850 dark:text-slate-100">{reportData.studentDetails.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">System Roll No</span>
                      <p className="text-sm font-semibold font-mono text-slate-705 dark:text-slate-350">Roll: #{reportData.studentDetails.roll_number}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Academic Stream</span>
                      <p className="text-sm font-bold text-emerald-650 dark:text-emerald-400">{reportData.studentDetails.class} / Section {reportData.studentDetails.section}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Registered Email</span>
                      <p className="text-xs text-slate-650 dark:text-slate-400 truncate select-all">{reportData.studentDetails.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Direct Mobile Call</span>
                      <p className="text-xs text-slate-650 dark:text-slate-400">{reportData.studentDetails.contact}</p>
                    </div>
                  </div>

                  <h5 className="font-bold text-sm text-slate-900 dark:text-white border-b border-gray-100 dark:border-slate-850 pb-2">Calendar Absence/Presence Ledger Logs</h5>
                  
                  {reportData.history.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-mono">No historic daily session records logged for this student.</div>
                  ) : (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300 text-left text-xs font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-950/25 uppercase tracking-widest leading-none">
                          <th className="py-3 px-4">Date Context</th>
                          <th className="py-3 px-4">Day Status</th>
                          <th className="py-3 px-4 text-right">Roster Verification Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.history.map((row: any, i: number) => (
                          <tr key={i} className="border-b border-gray-100 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-350">{row.date}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                                row.status === 'Present' ? 'text-emerald-650 dark:text-emerald-450' : 'text-rose-650'
                              }`}>
                                {row.status === 'Present' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                {row.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-300">
                              SYS-{Math.floor(1000 + (row.date.split('-').reduce((a:number,c:string)=>a+parseInt(c), 0)*7))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Monthly Aggressive Cohort Report Format */}
              {reportType === 'monthly' && Array.isArray(reportData) && (
                <div className="space-y-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-300 text-left text-xs font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 uppercase tracking-widest leading-none">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Roll</th>
                        <th className="py-3 px-4 text-center">Present</th>
                        <th className="py-3 px-4 text-center">Absent</th>
                        <th className="py-3 px-4 text-center">Total</th>
                        <th className="py-3 px-4 text-right">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row: any) => {
                        let rankColor = 'text-slate-800 dark:text-slate-200';
                        if (row.percentage < 60) rankColor = 'text-rose-500 font-bold';
                        else if (row.percentage < 75) rankColor = 'text-amber-500 font-semibold';
                        else rankColor = 'text-emerald-650 dark:text-emerald-400 font-bold';

                        return (
                          <tr key={row.student_id} className="border-b border-gray-100 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-650 dark:text-blue-400">{row.student_id}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.name}</td>
                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">#{row.roll_number}</td>
                            <td className="py-3.5 px-4 text-center text-emerald-650 font-semibold font-mono text-xs">{row.presentCount}</td>
                            <td className="py-3.5 px-4 text-center text-rose-500 font-semibold font-mono text-xs">{row.absentCount}</td>
                            <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-xs">{row.totalCount}</td>
                            <td className={`py-3.5 px-4 text-right font-mono text-sm ${rankColor}`}>{row.percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* High-fidelity official certificate stamp footer */}
        <div className="hidden print:flex justify-between items-end mt-16 pt-8 border-t border-gray-300 text-slate-500 text-xs" id="printable-stamp-footer">
          <div className="space-y-1">
            <p>Verification Code: AMS-STAMP-2026-X901</p>
            <p className="text-[10px] text-slate-350">Page 1 of 1 — Generated in EduAttendance mini project Portal</p>
          </div>
          <div className="text-center w-48 border-t border-slate-300 pt-2 font-mono">
            <span className="block font-semibold">Faculty Registrar Signature</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest">(Official System Seal)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
