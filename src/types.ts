/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  student_id: string;
  name: string;
  roll_number: string;
  class: string;
  section: string;
  email: string;
  contact: string;
}

export interface AttendanceRecord {
  attendance_id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent';
}

export interface User {
  id: string;
  username: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendancePercentage: number;
  recentActivity: Array<{
    attendance_id: string;
    studentName: string;
    rollNumber: string;
    class: string;
    section: string;
    status: 'Present' | 'Absent';
    date: string;
  }>;
  classwiseStats: Array<{
    className: string;
    present: number;
    total: number;
    percentage: number;
  }>;
  weeklyTrend: Array<{
    date: string;
    rate: number;
    present: number;
    absent: number;
  }>;
}

export interface ReportData {
  daily: Array<{
    student_id: string;
    name: string;
    roll_number: string;
    class: string;
    section: string;
    status: string;
  }>;
  studentWise: Array<{
    date: string;
    status: string;
  }>;
  studentDetails?: Student;
  monthly: Array<{
    student_id: string;
    name: string;
    roll_number: string;
    class: string;
    presentCount: number;
    absentCount: number;
    totalCount: number;
    percentage: number;
  }>;
}
