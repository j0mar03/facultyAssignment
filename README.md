# Faculty Load Management System

A comprehensive web application for managing faculty teaching loads at Polytechnic University of the Philippines (PUP) based on OVPAA Memorandum No. 5, Series of 2025.

## Features

- **Faculty Management**: Track faculty profiles, employment types, and ITEES ratings
- **Intelligent Load Assignment**: Automated scheduling with constraint validation
- **Real-time Compliance Monitoring**: Ensure adherence to university policies
- **Visual Schedule Management**: Interactive calendar with drag-and-drop functionality
- **Comprehensive Reporting**: Load distribution, compliance, and performance reports

## Tech Stack

- **Frontend**: React.js with TypeScript, Material-UI, Redux Toolkit
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with TypeORM
- **Calendar**: FullCalendar for scheduling interface

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd faculty-load-management
```

2. Install dependencies
```bash
npm install
npm run install:all
```

3. Set up environment variables
```bash
# Create .env file in root directory
cp .env.example .env

# Edit .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=faculty_load_db
# PORT=5000
# JWT_SECRET=your-secret-key-change-this-in-production
# NODE_ENV=development
# VITE_API_URL=http://localhost:5000/api
```

4. Set up the database

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL database container
docker-compose up -d

# The database will be automatically initialized with schema.sql
```

**Option B: Manual PostgreSQL Setup**
```bash
# Create database
createdb faculty_load_db

# Or using psql:
psql -U postgres
CREATE DATABASE faculty_load_db;
\q

# Run schema
psql -U postgres -d faculty_load_db -f database/schema.sql
```

5. Run the application
```bash
# Development mode (runs both backend and frontend)
npm run dev

# Or run separately:
npm run dev:backend   # Backend on http://localhost:5000
npm run dev:frontend  # Frontend on http://localhost:3000

# Production build
npm run build
npm start
```

## Database Setup

The project uses PostgreSQL. The database schema is located in `database/schema.sql`.

### Using Docker Compose

The easiest way to set up the database is using Docker:

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL 15 container
- Create the database `faculty_load_db`
- Automatically initialize it with the schema from `database/schema.sql`
- Persist data in a Docker volume

### Database Schema

The schema includes the following tables:
- `faculty` - Faculty member information
- `courses` - Course catalog
- `assignments` - Faculty-course assignments
- `itees_records` - ITEES performance ratings
- `users` - System users for authentication
- `sections` - Course sections
- `rooms` - Classroom information

### Database Backup and Restore

**Backup:**
```bash
# Using pg_dump
pg_dump -U postgres -d faculty_load_db > backup.sql

# Or using Docker (recommended)
docker exec faculty_load_postgres pg_dump -U postgres -d faculty_load_db --clean --if-exists > backup.sql
```

**Restore:**
```bash
# Restore from backup
psql -U postgres -d faculty_load_db < backup.sql

# Or using Docker (recommended)
docker exec -i faculty_load_postgres psql -U postgres -d faculty_load_db < backup.sql
```

**Transfer Database to Another Laptop:**
For detailed instructions on transferring your database data between laptops, see [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md).

## Project Structure

```
faculty-load-management/
├── backend/
│   ├── src/
│   │   ├── entities/        # TypeORM entities
│   │   ├── services/        # Business logic
│   │   ├── controllers/     # API controllers
│   │   ├── routes/          # Express routes
│   │   └── middleware/      # Express middleware
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   ├── services/        # API services
│   │   └── hooks/           # Custom hooks
│   └── package.json
└── database/
    └── schema.sql           # Database schema
```

## Key Features Implementation

### 1. ITEES-Based Load Management
- Automatically tracks faculty performance ratings
- Applies load restrictions based on consecutive low ratings
- Implements the load reduction matrix

### 2. Constraint Validation
- Time slot constraints (weekday/weekend differences)
- Maximum load limits per faculty type
- Night class requirements (4:30-9:00 PM)
- Conflict detection and resolution

### 3. Scheduling Algorithm
- Backtracking algorithm for optimal assignments
- Considers faculty preferences and constraints
- Prioritizes night classes and high-credit courses
- Provides alternative suggestions for conflicts

### 4. Reporting Dashboard
- Real-time compliance monitoring
- Load distribution visualization
- ITEES performance tracking
- Export capabilities for monitoring sheets

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Faculty Management
- `GET /api/faculty` - List all faculty
- `GET /api/faculty/:id` - Get faculty details
- `POST /api/faculty` - Create new faculty
- `PUT /api/faculty/:id` - Update faculty
- `GET /api/faculty/:id/load-summary` - Get faculty load summary

### Course Management
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/semester/:semester/:year` - Get courses by semester

### Schedule Management
- `POST /api/schedule/generate` - Generate optimal schedule
- `GET /api/schedule/conflicts` - Check for conflicts
- `POST /api/assignments/validate` - Validate assignment constraints

### Reports
- `GET /api/reports/load-distribution` - Load distribution report
- `GET /api/reports/compliance` - Compliance report
- `GET /api/reports/export/monitoring-sheet` - Export monitoring sheet

## Getting Started

### Setting Up on a New Laptop

For a complete step-by-step guide to set up this project on a new laptop with your existing database data, see [SETUP_NEW_LAPTOP.md](./SETUP_NEW_LAPTOP.md).

### GitHub Setup

For detailed instructions on uploading this project to GitHub and setting up the database, see [GITHUB_SETUP.md](./GITHUB_SETUP.md).

Quick steps:
1. Create a new repository on GitHub
2. Add remote: `git remote add origin https://github.com/YOUR_USERNAME/faculty-load-management.git`
3. Commit and push: `git add . && git commit -m "Initial commit" && git push -u origin main`

## License

MIT