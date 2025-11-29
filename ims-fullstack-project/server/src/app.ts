// server/src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'; // Import path

import roleRoutes from './routes/roleRoutes';
import staffRoutes from './routes/staffRoutes'; // <--- Import Staff Routes
import profileRoutes from './routes/profileRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// 1. Serve Uploaded Images Statically
// This allows <img src="http://localhost:5000/uploads/profiles/..." />
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 2. Routes
app.use('/api/roles', roleRoutes);
app.use('/api/staff', staffRoutes); // <--- Register Staff Routes
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success' });
});

export default app;