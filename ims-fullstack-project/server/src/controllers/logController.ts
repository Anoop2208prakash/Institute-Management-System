import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    // 1. Fetch General Activities (Matches your 'Activity' model)
    const generalActivities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // 2. Fetch Library Loans (Updated to match your MongoDB schema)
    const loanLogs = await prisma.loan.findMany({
      include: { 
        book: true,
        student: true, // Your schema uses 'student', not 'user' directly here
        teacher: true  // Your schema allows teachers to borrow too
      },
      orderBy: { issueDate: 'desc' }, // Schema uses 'issueDate', not 'checkoutDate'
      take: 15,
    });

    // 3. Fetch Recent Complaints (Matches your 'Complaint' model)
    const complaintLogs = await prisma.complaint.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Combine into a single timeline
    const combinedLogs = [
      ...generalActivities.map((log: any) => ({
        id: log.id,
        type: 'SYSTEM',
        message: `${log.action}: ${log.message}`,
        date: log.createdAt,
      })),
      ...loanLogs.map((log: any) => {
        const borrower = log.student?.fullName || log.teacher?.fullName || "System User";
        return {
          id: log.id,
          type: 'LIBRARY',
          message: `${borrower} issued "${log.book.title}"`,
          date: log.issueDate,
        };
      }),
      ...complaintLogs.map((log: any) => ({
        id: log.id,
        type: 'COMPLAINT',
        message: `New Complaint from ${log.student.fullName}: ${log.subject}`,
        date: log.createdAt,
      })),
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json(combinedLogs.slice(0, 50));
  } catch (error) {
    console.error("Log Fetch Error:", error);
    res.status(500).json({ message: 'Failed to fetch system logs.' });
  }
};