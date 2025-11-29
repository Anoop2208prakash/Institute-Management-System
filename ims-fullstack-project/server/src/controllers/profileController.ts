// server/src/controllers/profileController.ts
import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

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
      avatar: user.avatar, // <--- Now fetching directly from User table
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