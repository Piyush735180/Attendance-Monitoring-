-- ==========================================================
-- ATTENDANCE MONITORING SYSTEM - DATABASE SCHEMA
-- Suitable for MySQL / SQLite / PostgreSQL
-- College Mini Project - B.Tech / BCA
-- ==========================================================

-- 1. Create Users Table (Academic Administrators)
CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Students Table
CREATE TABLE IF NOT EXISTS Students (
    student_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    class VARCHAR(100) NOT NULL,
    section VARCHAR(10) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contact VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Attendance Table
CREATE TABLE IF NOT EXISTS Attendance (
    attendance_id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(15) CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    -- Prevent duplicate records for the same student on the same date
    UNIQUE (student_id, date)
);

-- ==========================================================
-- SAMPLE INSERT RECORDS FOR DEMONSTRATION
-- ==========================================================

-- Admin User credentials: username = admin, password = admin123
INSERT INTO Users (id, username, password_hash)
VALUES ('1', 'admin', 'admin123')
ON DUPLICATE KEY UPDATE username=username;

-- Default Students
INSERT INTO Students (student_id, name, roll_number, class, section, email, contact) VALUES
('STU001', 'Aarav Sharma', '101', 'B.Tech CSE', 'A', 'aarav.sharma@example.com', '9876543210'),
('STU002', 'Aditi Patel', '102', 'B.Tech CSE', 'A', 'aditi.patel@example.com', '9876543211'),
('STU003', 'Rohan Verma', '201', 'B.Tech CSE', 'B', 'rohan.verma@example.com', '9876543212'),
('STU004', 'Ananya Iyer', '202', 'B.Tech CSE', 'B', 'ananya.iyer@example.com', '9876543213'),
('STU005', 'Vikram Singh', '401', 'BCA', 'A', 'vikram.singh@example.com', '9876543214'),
('STU006', 'Meera Nair', '402', 'BCA', 'A', 'meera.nair@example.com', '9876543215');

-- Default Attendance Sample records for 2026-06-04
INSERT INTO Attendance (attendance_id, student_id, date, status) VALUES
('att_061', 'STU001', '2026-06-04', 'Present'),
('att_062', 'STU002', '2026-06-04', 'Present'),
('att_063', 'STU003', '2026-06-04', 'Present'),
('att_064', 'STU004', '2026-06-04', 'Absent'),
('att_065', 'STU005', '2026-06-04', 'Present'),
('att_066', 'STU006', '2026-06-04', 'Present');
