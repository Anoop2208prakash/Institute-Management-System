// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { logActivity } from '../utils/activityLogger'; // <--- Import Logger

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true } // Include role info
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // 4. Log the Activity
    await logActivity('User Login', `User ${user.email} (${user.role.displayName}) logged in.`);

    // 5. Send Response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.displayName
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};