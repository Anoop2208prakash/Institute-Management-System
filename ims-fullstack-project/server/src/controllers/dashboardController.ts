// server/src/controllers/dashboardController.ts
import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role; // 'admin', 'teacher', 'student', 'librarian', 'administrator'

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let stats: any = { type: 'UNKNOWN', cards: [] }; // Default init to prevent frontend crash

    // --- ADMIN / SUPER ADMIN / ADMINISTRATOR ---
    // Update: Added 'administrator' to this check
    if (role === 'admin' || role === 'super_admin' || role === 'administrator') {
        const studentCount = await prisma.student.count();
        const teacherCount = await prisma.teacher.count();
        const classCount = await prisma.class.count();
        const userCount = await prisma.user.count();
        
        stats = {
            type: 'ADMIN',
            cards: [
                { label: 'Total Students', value: studentCount, icon: 'users', color: '#1a7f37' },
                { label: 'Total Teachers', value: teacherCount, icon: 'chalkboard-teacher', color: '#0969da' },
                { label: 'Active Classes', value: classCount, icon: 'layer-group', color: '#8250df' },
                { label: 'Total Users', value: userCount, icon: 'user-shield', color: '#cf222e' },
            ]
        };
    } 
    
    // --- TEACHER ---
    else if (role === 'teacher') {
        const teacher = await prisma.teacher.findUnique({
            where: { userId },
            include: { classes: { include: { _count: { select: { students: true } } } }, subjects: true }
        });

        if (teacher) {
            const totalStudents = teacher.classes.reduce((acc, curr) => acc + curr._count.students, 0);
            stats = {
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
    else if (role === 'student') {
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
    else if (role === 'librarian') {
        const totalBooks = await prisma.book.count();
        const activeLoans = await prisma.loan.count({ where: { status: 'ISSUED' } });
        
        stats = {
            type: 'LIBRARIAN',
            cards: [
                { label: 'Total Books', value: totalBooks, icon: 'book', color: '#0969da' },
                { label: 'Active Loans', value: activeLoans, icon: 'hand-holding', color: '#9a6700' },
            ]
        };
    }
    
    // --- FINANCE ---
    else if (role === 'finance') {
         // Add finance logic here if needed
         stats = { type: 'FINANCE', cards: [] };
    }

    // --- DEFAULT FALLBACK ---
    // If no stats were generated (e.g. role not found or profile missing)
    if (!stats.cards) {
        stats.cards = [];
    }

    res.json(stats);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};