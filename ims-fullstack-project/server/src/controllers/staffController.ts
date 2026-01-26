// server/src/controllers/staffController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { logActivity } from '../utils/activityLogger';

// ------------------------------------------
// 1. REGISTER STAFF
// ------------------------------------------
export const registerStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, roleId, bloodGroup, joiningDate } = req.body;
    
    // FIXED: Cloudinary provides the full URL in req.file.path
    const avatarUrl = req.file ? req.file.path : null;

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
      // A. Create User (MongoDB ObjectIds are handled as strings)
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId, // Should be a valid string ObjectId
          avatar: avatarUrl, // The full https://res.cloudinary.com URL
          isActive: true,
        },
      });

      // B. Create specific profile based on Role
      const role = await tx.role.findUnique({ where: { id: roleId } });
      
      // Normalize role name for consistent matching
      const normalizedRole = role?.name.toUpperCase().replace(/_/g, ' ').trim();

      if (normalizedRole === 'TEACHER') {
        await tx.teacher.create({
          data: {
            userId: newUser.id,
            fullName,
            phone,
            bloodGroup,
            joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          },
        });
      } else {
         // Defaults to Admin profile (Super Admin, Librarian, Finance, Warden, etc.)
         await tx.admin.create({
           data: {
               userId: newUser.id,
               fullName,
               phone,
               bloodGroup,
           }
         });
      }

      return { user: newUser, roleName: role?.displayName || 'Staff' };
    });

    await logActivity('New Staff', `Registered ${fullName} as ${result.roleName}.`);
    res.status(201).json({ message: "Staff registered successfully", userId: result.user.id });

  } catch (error) {
    console.error("Staff Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------------------------------
// 2. GET ALL STAFF (For Directory)
// ------------------------------------------
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          name: { not: 'student' } 
        }
      },
      include: {
        role: true,
        teacherProfile: true,
        adminProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedStaff = staff.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role.displayName,
      // Returning the full Cloudinary URL from MongoDB Atlas
      avatar: u.avatar,
      name: u.teacherProfile?.fullName || u.adminProfile?.fullName || 'N/A',
      phone: u.teacherProfile?.phone || u.adminProfile?.phone || 'N/A',
      joinDate: u.createdAt
    }));

    res.json(formattedStaff);
  } catch (error) {
    console.error("Fetch Staff Error:", error);
    res.status(500).json({ message: 'Failed to fetch staff list' });
  }
};

// ------------------------------------------
// 3. DELETE STAFF
// ------------------------------------------
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // MongoDB ObjectId string

    const userToDelete = await prisma.user.findUnique({
        where: { id },
        include: { teacherProfile: true, adminProfile: true }
    });

    if (userToDelete) {
        const name = userToDelete.teacherProfile?.fullName || userToDelete.adminProfile?.fullName || userToDelete.email;
        
        await prisma.user.delete({ where: { id } });
        await logActivity('Staff Removed', `Removed staff member: ${name}`);
    }

    res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error("Delete Staff Error:", error);
    res.status(500).json({ message: 'Failed to delete staff member' });
  }
};