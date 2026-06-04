# Attendance Monitoring System (AMS)

An elegant, secure, and fully responsive **Attendance Monitoring System (AMS)** built as a full-stack web application using React (Vite) + Node.js (Express) + TypeScript. This project is meticulously designed to serve as an exemplary, professional, and easy-to-understand **college mini-project** suitable for B.Tech, BCA, and BSc Computer Science students.

---

## 🌟 Key Product Features

1. **Academic Authentication Module**
   - Secure Admin staff authentication flow matching credentials in database.
   - Secure token validation and automated browser state persistence.
   - Comprehensive multi-state notification feedback overlays.

2. **Executive Analytical Dashboard**
   - Live KPI cards: Total Students, Present Ratios, Absence Metrics, and Lecture compliance.
   - **Hand-crafted Dynamic SVG Charts**: Dynamic weekly attendance area trend mapping.
   - Interactive Recent Attendance Activities feed showing real-time logs.

3. **Student Directory Ledger (Full CRUD)**
   - View student directories with reactive searches and class filter dropdowns.
   - Modals for registering new students or adjusting academic details.
   - Full cascading checks (deleting a student automatically purges their historical attendance records).

4. **Dynamic Attendance Sheets**
   - Select dates and lecture classes to generate customized cohort sheets.
   - **Check-In/Check-Out UX**: Instant radio toggling between "Present" or "Absent".
   - Helper tools: "Mark All Present" or "Mark All Absent" to expedite record submissions.
   - Complete backend overwrite/upsert protections to prevent redundant duplicates on the same date.

5. **Multi-Format Report Aggregator**
   - **Daily Roster Report**: Details attendance states for all students on a specified date.
   - **Student-Wise Report**: Comprehensive list of dates and rates for a specified student.
   - **Class Monthly Report**: Aggregate cohort statistics showing total sheets, active presents, total absences, and compliance rates.
   - **Client-Side Export**: Complete CSV generator download link.
   - **Print-to-PDF Ready**: Specially designed CSS rules to print crisp report sheets with official stamps and registrar headers.

---

## 📂 Project Directory Structure

```text
attendance-monitoring-system/
│
├── database/
│   ├── db.json             # File-based JSON Database (No external SQL setup required for preview)
│   └── schema.sql          # Standard SQL DDL Schema & sample records (For your Project Report!)
│
├── src/
│   ├── components/         # Modular UX components
│   │   ├── Sidebar.tsx     # Navigation side panel
│   │   ├── Header.tsx      # Top bar with synchronized RTC clock
│   │   ├── DashboardView.tsx # Dashboard with inline custom SVG charts
│   │   ├── StudentView.tsx # Student CRUD and search listing
│   │   ├── AttendanceView.tsx # Attendance marking sheet
│   │   ├── ReportsView.tsx # Dynamic reports generation & Print CSS rules
│   │   ├── SettingsView.tsx # Faculty configuration values & Factory Reset controls
│   │   └── NotificationToast.tsx # Global responsive notification system
│   │
│   ├── types.ts            # Global TypeScript types (Student, Records, Dashboard Stats)
│   ├── App.tsx             # Master orchestrator & Academic Login form
│   ├── main.tsx            # React entry context
│   └── index.css           # Tailwind custom imports & dark-theme settings
│
├── server.ts               # Node.js + Express Full-Stack Server
├── tsconfig.json           # TS compiling configurations
├── vite.config.ts          # Vite build parameters & HMR specifications
└── package.json            # Deployment dependencies & scripts
```

---

## 🗄️ Database Architecture (`database/schema.sql`)

The system provides dual-mode data persistence:
1. **Interactive Sandbox Mode**: Operates out-of-the-box using the structured relational file-system store inside `/database/db.json` which persists modified states.
2. **Production SQL Mode**: A meticulously formatted SQL file at `/database/schema.sql` ready to be imported into **MySQL**, **SQLite**, or **PostgreSQL** for university evaluations.

### Table Relational Relationships
```sql
-- Students (Roll No & Email are Unique Constraints)
CREATE TABLE Students (
    student_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    class VARCHAR(100) NOT NULL,
    section VARCHAR(10) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contact VARCHAR(20) NOT NULL
);

-- Attendance (Compound Unique Constraint prevents repeating entries)
CREATE TABLE Attendance (
    attendance_id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(15) CHECK (status IN ('Present', 'Absent')),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    UNIQUE (student_id, date)
);
```

---

## 🌐 Complete REST API Endpoints

The backend Express engine (`server.ts`) exposes several endpoints, all fully protected by Bearer Token headers:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Validates admin and generates Session Token |
| **GET** | `/api/auth/me` | Validates session longevity |
| **GET** | `/api/students` | Queries students with parameters for `search` or `class` |
| **POST** | `/api/students` | Creates a new Student (Validates Unique ID, Email, Roll No) |
| **PUT** | `/api/students/:id` | Edits an existing Student |
| **DELETE** | `/api/students/:id` | Cascading delete a student and their historical attendances |
| **GET** | `/api/attendance/sheet` | Generates marking sheet matching specified class & date |
| **POST** | `/api/attendance/mark` | Saves / Overwrites daily class rows (Avoids duplicate dates) |
| **GET** | `/api/dashboard/stats` | Aggregates and returns daily totals, trend metrics |
| **GET** | `/api/reports/daily` | Compiles Daily Status aggregates |
| **GET** | `/api/reports/student` | Generates individual chronological report cards |
| **GET** | `/api/reports/monthly` | Compiles monthly presentee/absentee aggregate percentage totals |

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)

### Step 1: Install Dependencies
Inside the project root, download the required node modules:
```bash
npm install
```

### Step 2: Boot Server in Development Mode
Start both the backend Express router and the Vite asset builder on Port 3000:
```bash
npm run dev
```

### Step 3: Access College Dashboard
Open your favorite browser and visit:
```text
http://localhost:3000
```
- **Username**: `admin`
- **Password**: `admin123`

---

## 🎓 Why this project stands out for BCA/B.Tech Students:
- **No Extra Dependencies**: The analytical charts are built with **pure React SVGs**, completely avoiding bulky libraries and version conflicts.
- **Enterprise-Grade Clean Code**: Clear segregation of frontend templates, types, schemas, and REST architectures.
- **True Full-Stack**: Integrates actual server routes with custom express endpoints instead of client-side mocks.
- **High-Fidelity PDF Export**: Highly customized `@media print` CSS rules, giving you beautiful formal print letters instead of ugly browser screenshots.
