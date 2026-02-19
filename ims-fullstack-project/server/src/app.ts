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
import onlineExamRoutes from './routes/onlineExamRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import libraryRoutes from './routes/libraryRoutes';
import activityRoutes from './routes/activityRoutes';
import hostelRoutes from './routes/hostelRoutes'; 
import communicationRoutes from './routes/communicationRoutes';
import logRoutes from './routes/logRoutes';

dotenv.config();

const app: Application = express();

// --- MIDDLEWARES ---
app.use(express.json());

// FIXED: Added 'PATCH' and 'OPTIONS' to resolve CORS preflight errors
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] 
}));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- REGISTER ROUTES ---
app.use('/api/roles', roleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/students', studentRoutes);
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
app.use('/api/online-exams', onlineExamRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/hostel', hostelRoutes); 
app.use('/api/communication', communicationRoutes);
app.use('/api/logs', logRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Backend is active' });
});

export default app;