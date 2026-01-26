// server/src/controllers/dashboardController.ts
import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id; // MongoDB ObjectId string
    
    // Normalize role to handle variations like 'super_admin' or 'SUPER ADMIN'
    const role = req.user?.role?.toUpperCase().replace(/_/g, ' ').trim(); 

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Fetch basic user data including Cloudinary avatar
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true }
    });

    let stats: any = { 
        type: 'UNKNOWN', 
        cards: [], 
        avatar: currentUser?.avatar || null // Global avatar for dashboard header
    }; 

    // --- ADMIN / SUPER ADMIN / ADMINISTRATOR ---
    if (role === 'ADMIN' || role === 'SUPER ADMIN' || role === 'ADMINISTRATOR') {
        const [studentCount, teacherCount, classCount, userCount] = await Promise.all([
            prisma.student.count(),
            prisma.teacher.count(),
            prisma.class.count(),
            prisma.user.count()
        ]);
        
        stats = {
            ...stats,
            type: 'ADMIN',
            cards: [
                { label: 'Total Students', value: studentCount, icon: 'users', color: '#1a7f37' },
                { label: 'Total Teachers', value: teacherCount, icon: 'chalkboard-teacher', color: '#0969da' },
                { label: 'Active Classes', value: classCount, icon: 'layer-group', color: '#8250df' },
                { label: 'Total Users', value: userCount, icon: 'user-shield', color: '#cf222e' },
            ]
        };
    } 
    
    // --- WARDEN ---
    else if (role === 'WARDEN') {
        const adminProfile = await prisma.admin.findUnique({ where: { userId } });

        const [pendingPasses, openComplaints, occupiedRooms, totalRooms] = await Promise.all([
            prisma.gatePass.count({ where: { status: 'PENDING' } }),
            prisma.complaint.count({ where: { status: 'PENDING' } }),
            prisma.hostelAdmission.count({ where: { status: 'OCCUPIED' } }),
            prisma.room.count()
        ]);

        stats = {
            ...stats,
            type: 'WARDEN',
            name: adminProfile?.fullName || 'Warden',
            cards: [
                { label: 'Pending Gate Passes', value: pendingPasses, icon: 'gate-pass', color: '#f59e0b' },
                { label: 'Open Complaints', value: openComplaints, icon: 'tools', color: '#cf222e' },
                { label: 'Current Residents', value: occupiedRooms, icon: 'users', color: '#1a7f37' },
                { label: 'Total Hostel Rooms', value: totalRooms, icon: 'bed', color: '#0969da' }
            ]
        };
    }

    // --- TEACHER ---
    else if (role === 'TEACHER') {
        const teacher = await prisma.teacher.findUnique({
            where: { userId },
            include: { classes: { include: { _count: { select: { students: true } } } }, subjects: true }
        });

        if (teacher) {
            const totalStudents = teacher.classes.reduce((acc, curr) => acc + curr._count.students, 0);
            stats = {
                ...stats,
                type: 'TEACHER',
                name: teacher.fullName,
                cards: [
                    { label: 'My Classes', value: teacher.classes.length, icon: 'layer-group', color: '#0969da' },
                    { label: 'Total Students', value: totalStudents, icon: 'users', color: '#1a7f37' },
                    { label: 'Subjects Taught', value: teacher.subjects.length, icon: 'book', color: '#9a6700' },
                ]
            };
        }
    } 
    
    // --- STUDENT ---
    else if (role === 'STUDENT') {
        const student = await prisma.student.findUnique({
            where: { userId },
            include: { 
                attendance: true,
                fees: true,
                loans: { where: { status: 'ISSUED' } }
            }
        });

        if (student) {
            const totalDays = student.attendance.length;
            const presentDays = student.attendance.filter(a => a.status === 'PRESENT').length;
            const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

            const dueFees = student.fees
                .filter(f => f.status === 'PENDING' || f.status === 'PARTIAL')
                .reduce((acc, curr) => acc + Number(curr.amount), 0);

            stats = {
                ...stats,
                type: 'STUDENT',
                name: student.fullName,
                cards: [
                    { label: 'Attendance', value: `${attendancePct}%`, icon: 'check-square', color: attendancePct < 75 ? '#cf222e' : '#1a7f37' },
                    { label: 'Due Fees', value: `₹${dueFees}`, icon: 'file-invoice-dollar', color: dueFees > 0 ? '#cf222e' : '#1a7f37' },
                    { label: 'Books Borrowed', value: student.loans.length, icon: 'book-reader', color: '#0969da' },
                ]
            };
        }
    }

    // --- LIBRARIAN ---
    else if (role === 'LIBRARIAN') {
        const [totalBooks, activeLoans] = await Promise.all([
            prisma.book.count(),
            prisma.loan.count({ where: { status: 'ISSUED' } })
        ]);
        
        stats = {
            ...stats,
            type: 'LIBRARIAN',
            cards: [
                { label: 'Total Books', value: totalBooks, icon: 'book', color: '#0969da' },
                { label: 'Active Loans', value: activeLoans, icon: 'hand-holding', color: '#9a6700' },
            ]
        };
    }

    res.json(stats);

  } catch (e) {
    console.error("Dashboard Stats Error:", e);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};