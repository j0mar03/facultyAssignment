# Faculty Load Management System - Development Notes

## Project Overview
A comprehensive web application for managing faculty teaching loads at Polytechnic University of the Philippines (PUP) based on OVPAA Memorandum No. 5, Series of 2025.

## Technology Stack
- **Frontend**: React.js with TypeScript, Material-UI, Redux Toolkit, FullCalendar
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with TypeORM
- **Development**: Docker for database, WSL for development environment

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Docker Desktop for Windows (recommended) or Docker Engine in WSL
- WSL2 (Windows Subsystem for Linux)

### Docker Installation (Recommended: Docker Desktop for Windows)
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Install with WSL 2 integration enabled
3. Configure WSL integration in Docker Desktop settings
4. Verify installation: `docker --version` and `docker-compose --version`

### Database Setup
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Verify database is running
docker-compose ps
```

### Application Setup
```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

This starts:
- Backend API: http://localhost:5000
- Frontend app: http://localhost:3000

### Demo Credentials
- **Admin**: admin@pup.edu.ph / admin123
- **Chair**: fcruiz@pup.edu.ph / chair123 (Frescian C. Ruiz - Department Chairperson)
- **Dean**: dean.engineering@pup.edu.ph / dean123
- **Faculty**: jbruiz@pup.edu.ph / faculty123 (Jomar B. Ruiz - Laboratory Head)

## Project Structure
```
faculty-load-management/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── entities/       # TypeORM database models (User, Faculty, Course, Assignment, ITEESRecord)
│   │   ├── services/       # Business logic & scheduling algorithms
│   │   ├── controllers/    # API route handlers (Auth, Faculty, Course, Assignment, Schedule, Report)
│   │   ├── routes/         # Express route definitions
│   │   ├── middleware/     # Auth & error handling
│   │   ├── database/       # Database seeders and utilities
│   │   ├── types/          # TypeScript type definitions
│   │   └── config/         # Database configuration
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages (Dashboard, Faculty, Courses, Assignments, Schedule, Reports)
│   │   ├── store/          # Redux store & slices
│   │   ├── services/       # API service functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── theme.ts        # Material-UI theme configuration
├── database/               # Database schema & migrations
└── docker-compose.yml      # Docker configuration
```

## Key Features Implemented

### 1. Comprehensive Faculty Management System
- **Complete Faculty Profiles**: Employee ID, type, department, college, contact info
- **Employment Type Support**: Regular, Part-Time, Temporary, Designee with specific load limits
- **ITEES Rating Integration**: Performance tracking with automatic restriction enforcement
- **Load Tracking**: Real-time monitoring of regular and extra load assignments
- **Faculty Dashboard**: Visual load indicators, statistics, and restriction status
- **Advanced Search & Filtering**: By department, type, load status, and ratings
- **Faculty Schedule Calendar**: Weekly view with faculty filtering to visualize course loads and availability

### 2. Advanced Course Management
- **Comprehensive Course Database**: Code, name, credits, contact hours, program affiliation
- **Night Section Requirements**: Special handling for required evening classes (4:30-9:00 PM)
- **Enrollment Tracking**: Current vs. maximum capacity monitoring
- **Department Organization**: Filtering and organization by academic departments
- **Course Statistics**: Total courses, night classes, high enrollment tracking
- **Semester Management**: Academic year and semester-based organization

### 3. Intelligent Assignment Creation System
- **4-Step Assignment Wizard**:
  1. Faculty & Course Selection with detailed information display
  2. Time Slot Configuration with day/time selection
  3. Real-time Constraint Validation
  4. Review & Submit with final confirmation
- **Smart Autocomplete**: Faculty and course selection with search capabilities
- **Constraint Validation Engine**: Real-time checking of all university policies
- **Conflict Detection**: Automatic identification of scheduling conflicts
- **Load Limit Enforcement**: Prevents exceeding faculty capacity limits

### 4. Real-time Dashboard & Analytics
- **Live Statistics Dashboard**: Auto-updating faculty, course, and assignment counts
- **Compliance Monitoring**: Real-time violation detection and alerts
- **Night Class Coverage**: Percentage tracking and uncovered course identification
- **Load Distribution Analysis**: Faculty workload balance monitoring
- **Smart Alerts System**: Contextual warnings for pending issues

### 5. Comprehensive Reporting System
- **Load Distribution Report**: Faculty workload analysis with visual indicators
- **Compliance Monitoring**: Policy violation detection and detailed reporting
- **Night Class Coverage Analysis**: Required vs. actual evening class assignments
- **Export Functionality**: Monitoring sheet generation for administrative use
- **Department Analytics**: Performance metrics by academic department

### 6. Interactive Schedule Management
- **FullCalendar Integration**: Visual calendar with drag-and-drop functionality
- **Color-coded Events**: Assignment types distinguished by colors
- **Real-time Updates**: Live calendar updates when assignments change
- **Multiple View Options**: Month, week, and day calendar views
- **Event Details**: Click to view faculty, course, room, and time information
- **Schedule Generation**: Automatic optimal scheduling algorithm

### 7. Advanced Section Management System
- **Comprehensive Section Overview**: Visual summary cards with assignment statistics
- **Interactive Weekly Calendar**: Time-based grid view (7 AM - 9 PM, Monday-Saturday)
- **Section Filtering**: Dropdown filters by section code (DCPET 1-1, 1-2, 1-3)
- **Direct Faculty Assignment**: Click-to-assign interface with conflict detection
- **Room Management**: Integrated room assignment during faculty allocation
- **Real-time Conflict Detection**: Automatic scheduling overlap prevention
- **Color-coded Status**: Visual indicators for assigned, unassigned, and night sections
- **Section Details Management**: Complete CRUD operations with time slot editing

### 8. Faculty Schedule Visualization
- **Dual-Tab Interface**: Faculty List and Faculty Schedule views
- **Faculty-Specific Filtering**: Individual faculty schedule examination
- **Load Summary Cards**: Real-time workload tracking with visual indicators
- **Weekly Calendar Grid**: Comprehensive schedule overview with course blocks
- **Load Capacity Monitoring**: Visual feedback on faculty availability and limits
- **Schedule Statistics**: Section counts, night classes, student totals per faculty
- **Interactive Course Blocks**: Hover tooltips with detailed section information

### 9. Advanced Constraint Validation Engine
- **Load Limits Enforcement**: Per faculty type with real-time checking
  - Regular Faculty: 21 regular + 9 extra hours
  - Part-Time: 12 regular hours only
  - Temporary: 21 regular + 9 extra hours
  - Designee: 18 regular + 6 extra hours
- **ITEES-Based Restrictions**: Automatic extra load blocking for low-rated faculty
- **Time Slot Constraints**: Enforced university scheduling policies
- **Night Class Requirements**: Mandatory evening section validation
- **Conflict Prevention**: Automatic detection of scheduling overlaps
- **Integer Load Handling**: Fixed decimal-to-integer conversion for database consistency

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout

### Faculty Management
- `GET /api/faculty` - List all faculty
- `GET /api/faculty/:id` - Get faculty details
- `POST /api/faculty` - Create faculty member
- `PUT /api/faculty/:id` - Update faculty information
- `GET /api/faculty/:id/load-summary` - Get faculty load summary
- `POST /api/faculty/:id/itees-record` - Add ITEES rating

### Course Management
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/semester/:semester/:year` - Get courses by semester

### Assignment Management
- `GET /api/assignments` - List all assignments with relations
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments` - Create new assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment
- `POST /api/assignments/validate` - Validate assignment constraints
- `POST /api/assignments/:id/approve` - Approve assignment
- `GET /api/assignments/faculty/:facultyId` - Get assignments by faculty
- `GET /api/assignments/course/:courseId` - Get assignments by course

### Section Management
- `GET /api/sections` - List all sections with filtering options
- `GET /api/sections/:id` - Get section details with relations
- `POST /api/sections` - Create new section
- `PUT /api/sections/:id` - Update section information
- `DELETE /api/sections/:id` - Delete section
- `GET /api/sections/overview` - Get sections overview with statistics
- `POST /api/sections/:sectionId/assign-faculty` - Assign faculty to section
- `POST /api/sections/:sectionId/unassign-faculty` - Unassign faculty from section

### Schedule Management
- `GET /api/schedule/calendar` - Get all schedule events for calendar
- `POST /api/schedule/generate` - Generate optimal schedule
- `GET /api/schedule/conflicts` - Check for scheduling conflicts
- `POST /api/schedule/optimize` - Optimize existing schedule
- `GET /api/schedule/faculty/:id/calendar` - Get faculty-specific calendar
- `GET /api/schedule/room/:room/calendar` - Get room-specific calendar

### Reports & Dashboard
- `GET /api/reports/dashboard` - Real-time dashboard statistics and alerts
- `GET /api/reports/load-distribution` - Faculty load distribution analysis
- `GET /api/reports/compliance` - Compliance monitoring with violations
- `GET /api/reports/itees-summary` - ITEES rating summary by faculty
- `GET /api/reports/night-classes` - Night class coverage report
- `GET /api/reports/department/:department/summary` - Department analytics
- `GET /api/reports/export/monitoring-sheet` - Export monitoring sheet

## Development Commands

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run typecheck    # Run TypeScript checks
npm run lint         # Run ESLint
```

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run typecheck    # Run TypeScript checks
npm run lint         # Run ESLint
```

### Database
```bash
docker-compose up -d          # Start PostgreSQL
docker-compose down           # Stop PostgreSQL
docker-compose logs postgres  # View database logs
```

## Environment Configuration

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=faculty_load_db
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Database Schema

### Key Entities
- **User**: Authentication, roles (Admin, Chair, Dean, Faculty), profile information
- **Faculty**: Employee details, type classification, ITEES history, current load tracking
- **Course**: Course catalog, credit/contact hours, night section requirements, enrollment data
- **Assignment**: Faculty-course assignments with time slots, status, and approval workflow
- **ITEESRecord**: Performance evaluation history with ratings and impact on load restrictions

### Relationships
- User → Authentication & Authorization
- Faculty → Many Assignments (teaching assignments)
- Course → Many Assignments (faculty assignments)
- Faculty → Many ITEESRecords (performance evaluations)
- Assignment → Faculty & Course (many-to-one relationships)

## Business Rules Implementation

### OVPAA Memorandum No. 5 Compliance
1. **Load Restrictions**: Implemented based on faculty type and ITEES ratings
2. **Night Class Requirements**: All programs must offer 4:30-9:00 PM classes
3. **Time Slot Management**: Enforces weekday/weekend scheduling rules
4. **ITEES Performance Impact**: Consecutive low ratings restrict extra load assignments
5. **Administrative Service**: Tracks 3-night service requirements for designees

## Testing & Quality Assurance

### Type Safety
- Full TypeScript implementation
- Strict type checking enabled
- Interface definitions for all data models

### Code Quality
- ESLint configuration for both frontend and backend
- Consistent code formatting
- Error handling middleware

## Deployment Considerations

### Production Setup
1. Use production PostgreSQL database
2. Set secure JWT secrets
3. Enable CORS for production domains
4. Configure proper logging
5. Set up SSL certificates

### Performance Optimization
- Database indexing on frequently queried fields
- API response caching where appropriate
- Frontend code splitting and lazy loading
- Optimized calendar rendering for large datasets

## Future Enhancements

### Planned Features
1. Email notification system for deadline reminders
2. Excel export functionality for monitoring sheets
3. Mobile responsive design improvements
4. Real-time collaboration features
5. Integration with existing university systems
6. Advanced analytics and reporting dashboards
7. Automated schedule optimization algorithms

### Technical Improvements
1. Comprehensive test suite
2. CI/CD pipeline setup
3. API documentation with Swagger
4. Performance monitoring
5. Backup and recovery procedures

## Current System Status

### ✅ Completed Features
1. **Authentication System**: Role-based login with Admin, Chair, Dean accounts
2. **Faculty Management**: Complete CRUD operations with load tracking, ITEES integration, and schedule visualization
3. **Course Management**: Full course catalog with night section requirements and enrollment tracking
4. **Assignment Creation**: 4-step wizard with real-time validation and conflict detection
5. **Dashboard Analytics**: Live statistics with compliance monitoring and smart alerts
6. **Reporting System**: Load distribution, compliance monitoring, and night class coverage reports
7. **Schedule Management**: Interactive calendar with FullCalendar integration and event management
8. **Section Management**: Comprehensive section CRUD with weekly calendar view and direct faculty assignment
9. **Faculty Schedule View**: Weekly calendar visualization with faculty filtering and load monitoring
10. **Real-time Assignment**: Click-to-assign interface with conflict detection and room management
11. **Database Integration**: Automatic seeding with real DCPET course data and faculty information
12. **Integer Load Fix**: Resolved decimal-to-integer conversion issues for faculty load calculations

### 🔄 System Architecture
- **Backend**: Node.js + Express + TypeScript + TypeORM + PostgreSQL
- **Frontend**: React + TypeScript + Material-UI + Redux Toolkit + FullCalendar
- **Database**: PostgreSQL with Docker containerization
- **Real-time Updates**: Live dashboard and calendar synchronization
- **Validation Engine**: Comprehensive constraint checking and policy enforcement

### 📊 Sample Data Available
- **20 Faculty Members**: Real faculty from Department of Computer and Electronics Engineering Technology
  - 6 Regular Faculty (including 2 Designees with administrative positions)
  - 9 Part-Time Faculty
  - 5 Temporary Faculty (including 1 Casual mapped to Temporary)
- **Real DCPET Course Schedules**: Academic year 2025-2026 First semester
  - **DCPET 1-1**: 8 courses with complete time slots and room assignments
  - **DCPET 1-2**: 8 courses with time slots and room assignments
  - **DCPET 1-3**: 8 courses with time slots and room assignments
  - Night sections properly identified (4:30 PM - 9:00 PM classes)
- **Section Management**: 24+ sections ready for faculty assignment
- **ITEES Records**: Performance evaluation history for faculty
- **User Accounts**: Admin, Chair (Frescian C. Ruiz), Dean, and Faculty (Jomar B. Ruiz) access levels

## Troubleshooting

### Common Issues
1. **Database connection failed**: 
   - Ensure Docker Desktop is running
   - Run `docker-compose up -d` to start PostgreSQL
   - Check if port 5432 is available
2. **Port conflicts**: 
   - Backend typically runs on port 5000
   - Frontend auto-selects available ports (3000, 3001, 3002, etc.)
   - Check for other services using these ports
3. **JWT errors**: Verify JWT_SECRET is set in backend .env
4. **CORS issues**: Ensure frontend URL is allowed in CORS configuration
5. **Assignment validation fails**: 
   - Check faculty load limits and ITEES restrictions
   - Verify time slot constraints and night class requirements
   - Review existing assignments for conflicts

### Development Tips
1. **Database Management**:
   - Use Docker Desktop for reliable database setup
   - Database automatically seeds with sample data on first run
   - Check backend console for seeding status and any errors
2. **Type Safety**:
   - Keep TypeScript strict mode enabled
   - All entities use definite assignment assertions (!)
   - Comprehensive type definitions for all API responses
3. **Testing Features**:
   - Test constraint validation with different faculty types
   - Try creating assignments with conflicts to see validation
   - Monitor dashboard updates when creating new assignments
4. **Performance**:
   - Calendar optimized for large datasets
   - Real-time updates minimize unnecessary re-renders
   - Database queries include proper relations and filtering
5. **Data Management**:
   - Sample data provides realistic testing scenarios
   - Faculty have different load limits based on employment type
   - ITEES ratings impact extra load assignment capabilities

## License
MIT License - See LICENSE file for details