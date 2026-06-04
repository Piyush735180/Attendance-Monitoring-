/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface structures matching standard relational design inside JSON file
interface DBStructure {
  users: Array<{ id: string; username: string; password_hash: string }>;
  students: Array<{
    student_id: string;
    name: string;
    roll_number: string;
    class: string;
    section: string;
    email: string;
    contact: string;
  }>;
  attendance: Array<{
    attendance_id: string;
    student_id: string;
    date: string;
    status: 'Present' | 'Absent';
  }>;
}

const dbFolder = path.join(process.cwd(), 'database');
const dbPath = path.join(dbFolder, 'db.json');

// Memory DB fallback in case file-system fails
let cachedDb: DBStructure = {
  users: [{ id: '1', username: 'admin', password_hash: 'admin123' }],
  students: [],
  attendance: []
};

// Ensure database helper functions are durable and robust
async function readDb(): Promise<DBStructure> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    cachedDb = JSON.parse(data);
    return cachedDb;
  } catch (error) {
    // If db doesn't exist, try to write current cachedDb which has fallback defaults
    await fs.mkdir(dbFolder, { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(cachedDb, null, 2), 'utf-8');
    return cachedDb;
  }
}

async function writeDb(data: DBStructure): Promise<void> {
  cachedDb = data;
  await fs.mkdir(dbFolder, { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Set up standard JSON database in background
  await readDb();

  // Authentication Middleware
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
       res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
       return;
    }
    const token = authHeader.split(' ')[1];
    if (token === 'admin-session-token') {
      next();
    } else {
       res.status(401).json({ error: 'Unauthorized: Invalid token' });
       return;
    }
  };

  // ==========================================
  // AUTHENTICATION API
  // ==========================================
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const db = await readDb();
    const admin = db.users.find(u => u.username === username);

    if (admin && admin.password_hash === password) {
      res.json({
        success: true,
        token: 'admin-session-token',
        user: { id: admin.id, username: admin.username }
      });
    } else {
      res.status(400).json({ error: 'Invalid username or password' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({ user: { id: '1', username: 'admin' } });
  });

  // ==========================================
  // STUDENTS CRUD API
  // ==========================================
  
  // View Students (supports pagination, search, filters)
  app.get('/api/students', authMiddleware, async (req, res) => {
    const db = await readDb();
    const search = req.query.search ? String(req.query.search).toLowerCase() : '';
    const className = req.query.class ? String(req.query.class) : '';

    let results = [...db.students];

    if (search) {
      results = results.filter(s => 
        s.name.toLowerCase().includes(search) || 
        s.student_id.toLowerCase().includes(search) ||
        s.roll_number.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      );
    }

    if (className) {
      results = results.filter(s => s.class === className);
    }

    res.json(results);
  });

  // Add Student
  app.post('/api/students', authMiddleware, async (req, res) => {
    const { student_id, name, roll_number, class: cls, section, email, contact } = req.body;

    if (!student_id || !name || !roll_number || !cls || !section || !email || !contact) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const db = await readDb();

    // Validations for distinct student data
    if (db.students.some(s => s.student_id === student_id)) {
      res.status(400).json({ error: `Student with ID '${student_id}' already exists.` });
      return;
    }
    if (db.students.some(s => s.roll_number === roll_number && s.class === cls && s.section === section)) {
      res.status(400).json({ error: `Roll number '${roll_number}' already exists in class ${cls} Section ${section}.` });
      return;
    }
    if (db.students.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      res.status(400).json({ error: `Email Address '${email}' is already in use.` });
      return;
    }

    const newStudent = { student_id, name, roll_number, class: cls, section, email, contact };
    db.students.push(newStudent);
    await writeDb(db);

    res.status(201).json({ success: true, message: 'Student added successfully!', student: newStudent });
  });

  // Edit Student
  app.put('/api/students/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, roll_number, class: cls, section, email, contact } = req.body;

    if (!name || !roll_number || !cls || !section || !email || !contact) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const db = await readDb();
    const index = db.students.findIndex(s => s.student_id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    // Validation for roll number constraints excluding itself
    if (db.students.some(s => s.student_id !== id && s.roll_number === roll_number && s.class === cls && s.section === section)) {
      res.status(400).json({ error: `Roll number '${roll_number}' already exists in class ${cls} Section ${section}.` });
      return;
    }

    // Validation for email exclusion
    if (db.students.some(s => s.student_id !== id && s.email.toLowerCase() === email.toLowerCase())) {
      res.status(400).json({ error: `Email address '${email}' is already in use by another student.` });
      return;
    }

    db.students[index] = { ...db.students[index], name, roll_number, class: cls, section, email, contact };
    await writeDb(db);

    res.json({ success: true, message: 'Student updated successfully!', student: db.students[index] });
  });

  // Delete Student (Cascading Delete on Attendance)
  app.delete('/api/students/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const db = await readDb();

    const initialCount = db.students.length;
    db.students = db.students.filter(s => s.student_id !== id);

    if (db.students.length === initialCount) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    // Cascade delete attendance records
    db.attendance = db.attendance.filter(att => att.student_id !== id);
    await writeDb(db);

    res.json({ success: true, message: 'Student deleted successfully!' });
  });


  // ==========================================
  // ATTENDANCE API
  // ==========================================

  // Mark/Update Attendance list for a specific Date
  app.post('/api/attendance/mark', authMiddleware, async (req, res) => {
    const { date, records } = req.body; // records: Array of { student_id, status: 'Present' | 'Absent' }

    if (!date || !records || !Array.isArray(records)) {
      res.status(400).json({ error: 'Date and valid records array are required' });
      return;
    }

    const db = await readDb();

    for (const record of records) {
      const { student_id, status } = record;
      if (!student_id || (status !== 'Present' && status !== 'Absent')) {
        continue;
      }

      // Check for duplicate attendance record on the same date
      const existingIndex = db.attendance.findIndex(att => att.student_id === student_id && att.date === date);

      if (existingIndex > -1) {
        // Update attendance status
        db.attendance[existingIndex].status = status;
      } else {
        // Create new unique attendance record
        db.attendance.push({
          attendance_id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          student_id,
          date,
          status
        });
      }
    }

    await writeDb(db);
    res.json({ success: true, message: `Attendance updated successfully for ${date}!` });
  });

  // Get marked attendance records for a Class + Date
  app.get('/api/attendance/sheet', authMiddleware, async (req, res) => {
    const date = req.query.date ? String(req.query.date) : '';
    const className = req.query.class ? String(req.query.class) : '';

    if (!date || !className) {
      res.status(400).json({ error: 'Date and Class are required queries' });
      return;
    }

    const db = await readDb();

    // Get all students of specified Class
    const classStudents = db.students.filter(s => s.class === className);

    // Map each student to their attendance status on that date (or blank)
    const sheet = classStudents.map(student => {
      const att = db.attendance.find(a => a.student_id === student.student_id && a.date === date);
      return {
        ...student,
        status: att ? att.status : '' // '', 'Present', or 'Absent'
      };
    });

    res.json(sheet);
  });


  // ==========================================
  // DASHBOARD STATISTICS API
  // ==========================================
  app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
    const db = await readDb();
    const studentsList = db.students;
    const attendanceRecords = db.attendance;

    // Use current active date or fallback
    let targetDate = '2026-06-04'; // default based on active dates
    
    // Check if there are today records
    const todayRecords = attendanceRecords.filter(a => a.date === targetDate);
    const presentToday = todayRecords.filter(a => a.status === 'Present').length;
    const absentToday = todayRecords.filter(a => a.status === 'Absent').length;

    // Calculate Overall attendance percentage
    const totalAttendCount = attendanceRecords.length;
    const presentTotalCount = attendanceRecords.filter(a => a.status === 'Present').length;
    const overallPercentage = totalAttendCount > 0 ? Math.round((presentTotalCount / totalAttendCount) * 100) : 0;

    // Classwise stats
    const classes = Array.from(new Set(studentsList.map(s => s.class)));
    const classwiseStats = classes.map(className => {
      const clsStudents = studentsList.filter(s => s.class === className);
      const studentIds = clsStudents.map(s => s.student_id);

      // Total records for this class
      const clsRecords = attendanceRecords.filter(a => studentIds.includes(a.student_id));
      const clsPresent = clsRecords.filter(a => a.status === 'Present').length;
      
      return {
        className,
        present: clsPresent,
        total: clsRecords.length,
        percentage: clsRecords.length > 0 ? Math.round((clsPresent / clsRecords.length) * 100) : 0
      };
    });

    // Recent activities (last 8 attendance records)
    const sortedAttendance = [...attendanceRecords]
      .sort((a,b) => b.date.localeCompare(a.date))
      .slice(0, 8);

    const recentActivity = sortedAttendance.map(att => {
      const student = studentsList.find(s => s.student_id === att.student_id);
      return {
        attendance_id: att.attendance_id,
        studentName: student ? student.name : 'Unknown',
        rollNumber: student ? student.roll_number : 'N/A',
        class: student ? student.class : 'N/A',
        section: student ? student.section : 'N/A',
        status: att.status,
        date: att.date
      };
    });

    // Weekly Trends (last 5 active dates)
    const activeDates = Array.from(new Set(attendanceRecords.map(a => a.date)))
      .sort()
      .slice(-5);

    const weeklyTrend = activeDates.map(dateStr => {
      const dateRecords = attendanceRecords.filter(a => a.date === dateStr);
      const presCount = dateRecords.filter(a => a.status === 'Present').length;
      const rate = dateRecords.length > 0 ? Math.round((presCount / dateRecords.length) * 100) : 0;
      return {
        date: dateStr,
        rate,
        present: presCount,
        absent: dateRecords.length - presCount
      };
    });

    res.json({
      totalStudents: studentsList.length,
      presentToday,
      absentToday,
      attendancePercentage: overallPercentage,
      recentActivity,
      classwiseStats,
      weeklyTrend
    });
  });


  // ==========================================
  // REPORTS MODULE API
  // ==========================================
  
  // Daily attendance details
  app.get('/api/reports/daily', authMiddleware, async (req, res) => {
    const date = req.query.date ? String(req.query.date) : '';
    if (!date) {
      res.status(400).json({ error: 'Date is required for Daily Report' });
      return;
    }

    const db = await readDb();
    
    const report = db.students.map(student => {
      const record = db.attendance.find(a => a.student_id === student.student_id && a.date === date);
      return {
        student_id: student.student_id,
        name: student.name,
        roll_number: student.roll_number,
        class: student.class,
        section: student.section,
        status: record ? record.status : 'Not Marked'
      };
    });

    res.json(report);
  });

  // Student-wise Report
  app.get('/api/reports/student', authMiddleware, async (req, res) => {
    const student_id = req.query.student_id ? String(req.query.student_id) : '';
    if (!student_id) {
      res.status(400).json({ error: 'Student ID is required' });
      return;
    }

    const db = await readDb();
    const student = db.students.find(s => s.student_id === student_id);

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const history = db.attendance
      .filter(a => a.student_id === student_id)
      .sort((a,b) => b.date.localeCompare(a.date))
      .map(att => ({
        date: att.date,
        status: att.status
      }));

    res.json({
      studentDetails: student,
      history
    });
  });

  // Class/Section/Monthly Aggregation Report
  app.get('/api/reports/monthly', authMiddleware, async (req, res) => {
    const className = req.query.class ? String(req.query.class) : '';
    const section = req.query.section ? String(req.query.section) : '';
    const month = req.query.month ? String(req.query.month) : ''; // Format: "YYYY-MM"

    if (!className) {
      res.status(400).json({ error: 'Class name is required' });
      return;
    }

    const db = await readDb();

    // Filter students by class and optionally section
    let filterStudents = db.students.filter(s => s.class === className);
    if (section) {
      filterStudents = filterStudents.filter(s => s.section === section);
    }

    const report = filterStudents.map(student => {
      // Find all attendances for this student, optionally matching specific month
      let studentAtts = db.attendance.filter(a => a.student_id === student.student_id);
      if (month) {
        studentAtts = studentAtts.filter(a => a.date.startsWith(month));
      }

      const presentCount = studentAtts.filter(a => a.status === 'Present').length;
      const absentCount = studentAtts.filter(a => a.status === 'Absent').length;
      const totalCount = studentAtts.length;
      const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

      return {
        student_id: student.student_id,
        name: student.name,
        roll_number: student.roll_number,
        class: student.class,
        section: student.section,
        presentCount,
        absentCount,
        totalCount,
        percentage
      };
    });

    res.json(report);
  });

  // ==========================================
  // VITE DEV SERVER OR STATIC FILES BUILD CONFIG
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback using wildcard matching for standard Express router
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OK] Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CRITICAL] Failed to launch backend server:', err);
});
