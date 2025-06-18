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
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up the database
```bash
createdb faculty_load_db
```

5. Run the application
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

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

## License

MIT