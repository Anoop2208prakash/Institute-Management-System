// server/src/controllers/profileController.ts
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// ------------------------------------------
// 1. GET PROFILE (View)
// ------------------------------------------
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send('Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        teacherProfile: true,
        studentProfile: true,
        adminProfile: true
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    let profileData: any = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      roleDisplay: user.role.displayName,
      avatar: user.avatar, // Fetched directly from User table
      name: '',
      sID: '',
      details: {}
    };

    if (user.teacherProfile) {
      profileData.name = user.teacherProfile.fullName;
      profileData.sID = user.teacherProfile.id.substring(0, 8).toUpperCase();
      profileData.details = {
        phone: user.teacherProfile.phone,
        bloodGroup: user.teacherProfile.bloodGroup,
        joinDate: user.teacherProfile.joiningDate,
      };
    } 
    else if (user.studentProfile) {
      profileData.name = user.studentProfile.fullName;
      profileData.sID = user.studentProfile.admissionNo;
      profileData.details = {
        phone: user.studentProfile.phone,
        bloodGroup: user.studentProfile.bloodGroup,
        joinDate: user.createdAt,
      };
    }
    else if (user.adminProfile) {
        profileData.name = user.adminProfile.fullName;
        profileData.sID = "ADM-" + user.adminProfile.id.substring(0, 5);
        profileData.details = {
            phone: user.adminProfile.phone,
        };
    }

    res.json(profileData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ------------------------------------------
// 2. UPDATE PROFILE (Edit)
// ------------------------------------------
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send('Unauthorized');

    // Extract fields from FormData
    const { fullName, phone, password, bloodGroup } = req.body;
    
    // Check if a new file was uploaded
    const avatarPath = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

    // 1. Prepare User Table Updates (Auth & Identity)
    const userUpdates: any = {};
    if (avatarPath) userUpdates.avatar = avatarPath; // Update centralized avatar
    if (password && password.trim() !== "") {
      userUpdates.password = await bcrypt.hash(password, 10);
    }

    // 2. Prepare Profile Table Updates (Details)
    const profileUpdates: any = {};
    if (fullName) profileUpdates.fullName = fullName;
    if (phone) profileUpdates.phone = phone;
    if (bloodGroup) profileUpdates.bloodGroup = bloodGroup;

    // 3. Execute Transaction (Update both tables safely)
    await prisma.$transaction(async (tx) => {
      
      // A. Update User Logic (if fields exist)
      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdates,
        });
      }

      // B. Update Specific Profile Logic
      // We need to check the role again to know WHICH table to update
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });

      if (!user) throw new Error("User not found during update");

      if (user.role.name === 'teacher') {
        await tx.teacher.update({
          where: { userId },
          data: profileUpdates,
        });
      } else if (user.role.name === 'student') {
        await tx.student.update({
          where: { userId },
          data: profileUpdates,
        });
      } else {
        // For Admins/Super Admins
        // Remove fields that don't exist on Admin table (like bloodGroup)
        delete profileUpdates.bloodGroup; 
        
        await tx.admin.update({
          where: { userId },
          data: profileUpdates,
        });
      }
    });

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};