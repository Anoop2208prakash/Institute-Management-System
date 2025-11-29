// server/src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// 1. Middlewares
app.use(express.json()); // Parse JSON bodies

// 2. CORS Configuration (Allow Vite Frontend)
app.use(cors({
  origin: 'http://localhost:5173', // The default Vite port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// 3. Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'IMS Backend is running smoothly', 
    timestamp: new Date() 
  });
});

export default app;