-- Faculty Load Management Database Schema
-- PUP OVPAA Memorandum No. 5, Series of 2025

-- Create database
CREATE DATABASE IF NOT EXISTS faculty_load_db;
USE faculty_load_db;

-- Faculty table
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Regular', 'PartTime', 'Temporary', 'Designee')),
    department VARCHAR(100) NOT NULL,
    college VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB,
    current_regular_load DECIMAL(4,1) DEFAULT 0,
    current_extra_load DECIMAL(4,1) DEFAULT 0,
    consecutive_low_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    credits DECIMAL(3,1) NOT NULL,
    contact_hours DECIMAL(4,1) NOT NULL,
    program VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    requires_night_section BOOLEAN DEFAULT false,
    preferred_time_slots JSONB,
    room VARCHAR(50),
    max_students INTEGER DEFAULT 40,
    enrolled_students INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES faculty(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('Regular', 'Extra', 'OJT', 'Seminar')),
    status VARCHAR(20) DEFAULT 'Proposed' CHECK (status IN ('Proposed', 'Approved', 'Active', 'Completed')),
    time_slot JSONB NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    section VARCHAR(20),
    room VARCHAR(50),
    credit_hours DECIMAL(4,1) NOT NULL,
    contact_hours DECIMAL(4,1) NOT NULL,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    notes TEXT,
    is_substitution BOOLEAN DEFAULT false,
    original_faculty_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ITEES Records table
CREATE TABLE itees_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES faculty(id),
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    rating VARCHAR(20) NOT NULL CHECK (rating IN ('Outstanding', 'Very Satisfactory', 'Satisfactory', 'Fair', 'Poor')),
    numerical_score DECIMAL(3,2) NOT NULL,
    evaluator_count INTEGER,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Chairperson', 'Coordinator', 'Faculty', 'Viewer')),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_faculty_type ON faculty(type);
CREATE INDEX idx_faculty_department ON faculty(department);
CREATE INDEX idx_courses_semester ON courses(semester, academic_year);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_assignments_faculty ON assignments(faculty_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_semester ON assignments(semester, academic_year);
CREATE INDEX idx_itees_faculty ON itees_records(faculty_id);
CREATE INDEX idx_itees_semester ON itees_records(semester, academic_year);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();