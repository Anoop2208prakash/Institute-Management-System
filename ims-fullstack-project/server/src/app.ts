// server/src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import Routes
import roleRoutes from './routes/roleRoutes';
import authRoutes from './routes/authRoutes';
import staffRoutes from './routes/staffRoutes';
import profileRoutes from './routes/profileRoutes';
import studentRoutes from './routes/studentRoutes';
import libraryRoutes from './routes/libraryRoutes';
import classRoutes from './routes/classRoutes';
import subjectRoutes from './routes/subjectRoutes';
import semesterRoutes from './routes/semesterRoutes';
import examRoutes from './routes/examRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import orderRoutes from './routes/orderRoutes';
import announcementRoutes from './routes/announcementRoutes';
import teacherRoutes from './routes/teacherRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import markRoutes from './routes/markRoutes';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Static Files (Images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register Routes
app.use('/api/roles', roleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', markRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Backend is active' });
});

export default app;