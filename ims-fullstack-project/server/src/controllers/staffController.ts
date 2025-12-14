// server/src/controllers/staffController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { logActivity } from '../utils/activityLogger'; // <--- Import Logger

// ------------------------------------------
// 1. REGISTER STAFF
// ------------------------------------------
export const registerStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, dob, roleId, bloodGroup, joiningDate } = req.body;
    
    // Get the file path if an image was uploaded
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
      // A. Create User with Avatar (Centralized in User table)
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId,
          avatar: profileImage, 
          isActive: true,
        },
      });

      // B. Create specific profile based on Role
      const role = await tx.role.findUnique({ where: { id: roleId } });

      if (role?.name === 'teacher') {
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
         // Default to Admin profile for non-teachers (Super Admin, Finance, Librarian, etc.)
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

    // C. Log the Activity
    await logActivity('New Staff', `Registered ${fullName} as ${result.roleName}.`);

    console.log(`✅ Staff registered: ${result.user.email}`);
    res.status(201).json({ message: "Staff registered successfully", userId: result.user.id });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------------------------------
// 2. GET ALL STAFF (For Directory)
// ------------------------------------------
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    // Fetch users who are NOT students
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

    // Format data for the frontend table
    const formattedStaff = staff.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role.displayName,
      avatar: u.avatar,
      // Pick name/phone from the correct profile (Teacher vs Admin)
      name: u.teacherProfile?.fullName || u.adminProfile?.fullName || 'N/A',
      phone: u.teacherProfile?.phone || u.adminProfile?.phone || 'N/A',
      joinDate: u.createdAt
    }));

    res.json(formattedStaff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch staff list' });
  }
};

// ------------------------------------------
// 3. DELETE STAFF
// ------------------------------------------
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find user first to get name for the log
    const userToDelete = await prisma.user.findUnique({
        where: { id },
        include: { teacherProfile: true, adminProfile: true }
    });

    if (userToDelete) {
        const name = userToDelete.teacherProfile?.fullName || userToDelete.adminProfile?.fullName || userToDelete.email;
        
        // Prisma cascade delete handles profiles automatically
        await prisma.user.delete({
            where: { id }
        });

        // Log the Deletion
        await logActivity('Staff Removed', `Removed staff member: ${name}`);
    }

    res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: 'Failed to delete staff member' });
  }
};