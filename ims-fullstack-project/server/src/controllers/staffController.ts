// server/src/controllers/staffController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';

export const registerStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, dob, roleId, bloodGroup, joiningDate } = req.body;
    
    // 1. Get the file path
    const profileImage = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    if (!email || !password || !roleId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // A. Create User with Avatar (Saving it here now!)
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId,
          avatar: profileImage, // <--- SAVED TO USER TABLE
          isActive: true,
        },
      });

      // B. Create Profile (Without duplicating avatar)
      const role = await tx.role.findUnique({ where: { id: roleId } });

      if (role?.name === 'teacher') {
        await tx.teacher.create({
          data: {
            userId: newUser.id,
            fullName,
            phone,
            bloodGroup,
            // avatar removed from here
          },
        });
      } else {
         await tx.admin.create({
            data: {
                userId: newUser.id,
                fullName,
                phone,
                // avatar removed from here
            }
         });
      }

      return newUser;
    });

    console.log(`✅ Staff registered: ${result.email} with avatar: ${result.avatar}`);
    res.status(201).json({ message: "Staff registered successfully", userId: result.id });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};