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
    // MongoDB Atlas uses string IDs (ObjectIds)
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

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
      // Avatar is now the full Cloudinary URL from the database
      avatar: user.avatar, 
      name: '',
      sID: '',
      details: {}
    };

    if (user.teacherProfile) {
      profileData.name = user.teacherProfile.fullName;
      profileData.sID = user.teacherProfile.id.substring(user.teacherProfile.id.length - 8).toUpperCase();
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
        profileData.sID = "ADM-" + user.adminProfile.id.substring(user.adminProfile.id.length - 5);
        profileData.details = {
            phone: user.adminProfile.phone,
            bloodGroup: user.adminProfile.bloodGroup,
        };
    }

    res.json(profileData);

  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProfile = getMyProfile;

// ------------------------------------------
// 2. UPDATE PROFILE (Edit)
// ------------------------------------------
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { fullName, phone, password, bloodGroup } = req.body;
    
    // Cloudinary engine saves the URL in req.file.path
    const avatarUrl = req.file ? req.file.path : undefined;

    const userUpdates: any = {};
    if (avatarUrl) userUpdates.avatar = avatarUrl;
    if (password && password.trim() !== "") {
      userUpdates.password = await bcrypt.hash(password, 10);
    }

    const profileUpdates: any = {};
    if (fullName) profileUpdates.fullName = fullName;
    if (phone) profileUpdates.phone = phone;
    if (bloodGroup) profileUpdates.bloodGroup = bloodGroup;

    await prisma.$transaction(async (tx) => {
      
      // A. Update Core User (Avatar & Security)
      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdates,
        });
      }

      // B. Fetch role for normalized conditional logic
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });

      if (!user) throw new Error("User not found during update");

      // Normalize role string (e.g., "super_admin" -> "SUPER ADMIN")
      const normalizedRole = user.role.name.toUpperCase().replace(/_/g, ' ').trim();

      if (normalizedRole === 'TEACHER') {
        await tx.teacher.update({
          where: { userId },
          data: profileUpdates,
        });
      } else if (normalizedRole === 'STUDENT') {
        await tx.student.update({
          where: { userId },
          data: profileUpdates,
        });
      } else {
        // Covers ADMIN, SUPER ADMIN, ADMINISTRATOR, WARDEN
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