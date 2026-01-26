// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

// ------------------------------------------
// 1. REGISTER (Signup)
// ------------------------------------------
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, roleName, fullName } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // 2. Find the Role ID in MongoDB Atlas
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      res.status(400).json({ message: 'Invalid role specified' });
      return;
    }

    // 3. Handle Cloudinary Image URL
    // FIXED: Capture the full URL from Cloudinary (req.file.path) 
    // instead of the local filename to fix image visibility
    const avatarUrl = req.file ? req.file.path : null;

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User & Profile in a Transaction
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: role.id, 
        avatar: avatarUrl, // Will now store "https://res.cloudinary.com/..."
        adminProfile: roleName.toUpperCase() === 'ADMIN' ? {
          create: { fullName }
        } : undefined,
      },
      include: { role: true }
    });

    await logActivity('User Registration', `New user ${email} registered as ${role.displayName}.`);

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { id: newUser.id, email: newUser.email, avatar: newUser.avatar } 
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// ------------------------------------------
// 2. LOGIN
// ------------------------------------------
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true } 
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate JWT Token using Secret from .env
    const token = jwt.sign(
      { id: user.id, role: user.role.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' } 
    );

    await logActivity('User Login', `User ${user.email} logged in.`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.displayName,
        avatar: user.avatar 
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};