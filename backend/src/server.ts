import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { DatabaseSeeder } from './database/seeders';
import facultyRoutes from './routes/faculty.routes';
import courseRoutes from './routes/course.routes';
import assignmentRoutes from './routes/assignment.routes';
import scheduleRoutes from './routes/schedule.routes';
import reportRoutes from './routes/report.routes';
import authRoutes from './routes/auth.routes';
import sectionRoutes from './routes/section.routes';
import roomRoutes from './routes/room.routes';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', authMiddleware, facultyRoutes);
app.use('/api/courses', authMiddleware, courseRoutes);
app.use('/api/assignments', authMiddleware, assignmentRoutes);
app.use('/api/schedule', authMiddleware, scheduleRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/sections', authMiddleware, sectionRoutes);
app.use('/api/rooms', authMiddleware, roomRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize database and start server
AppDataSource.initialize()
  .then(async () => {
    console.log('Database connection established');
    
    // Run database seeder
    try {
      await DatabaseSeeder.seed();
    } catch (error) {
      console.error('Database seeding failed:', error);
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });