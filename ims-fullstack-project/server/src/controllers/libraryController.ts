// server/src/controllers/libraryController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// --- BOOK MANAGEMENT ---

// 1. GET ALL BOOKS
export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({ orderBy: { title: 'asc' } });
    res.json(books);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

// 2. ADD BOOK
export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role?.toUpperCase().replace(/_/g, ' '); // Normalize role check
    const allowedRoles = ['LIBRARIAN', 'SUPER ADMIN', 'ADMIN'];
    
    if (!role || !allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Access Denied: Librarians only" });
    }

    const { title, author, isbn, category, quantity } = req.body;

    const existing = await prisma.book.findUnique({ where: { isbn } });
    if (existing) return res.status(400).json({ message: "Book with this ISBN already exists" });

    const newBook = await prisma.book.create({
      data: {
        title, author, isbn, category, 
        quantity: Number(quantity),
        available: Number(quantity) 
      }
    });

    res.status(201).json(newBook);
  } catch (e) {
    res.status(500).json({ error: "Failed to add book" });
  }
};

// --- LOAN MANAGEMENT ---

// 4. GET LOANS (UPDATED for Avatars)
export const getLoans = async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({
            include: { 
                book: true,
                // FIXED: Include 'user' for student and teacher to get Cloudinary avatars
                student: { include: { user: { select: { avatar: true } } } },
                teacher: { include: { user: { select: { avatar: true } } } }
            },
            orderBy: { issueDate: 'desc' }
        });

        const formatted = loans.map(l => ({
            id: l.id,
            bookTitle: l.book.title,
            studentName: l.student?.fullName || l.teacher?.fullName || 'Unknown',
            admissionNo: l.student?.admissionNo || l.teacher?.userId || 'N/A',
            // FIXED: Delivering full Cloudinary URL directly
            avatar: l.student?.user?.avatar || l.teacher?.user?.avatar || null,
            dueDate: l.dueDate,
            status: l.status
        }));

        res.json(formatted);
    } catch (e) {
        console.error("Fetch Loans Error:", e);
        res.status(500).json({ error: "Failed to fetch loans" });
    }
};

// 5. ISSUE BOOK
export const issueBook = async (req: AuthRequest, res: Response) => {
    try {
        const role = req.user?.role?.toUpperCase().replace(/_/g, ' ');
        if (role !== 'LIBRARIAN' && role !== 'SUPER ADMIN') return res.status(403).json({ message: "Denied" });

        const { bookId, admissionNo, dueDate } = req.body;

        let student = await prisma.student.findUnique({ where: { admissionNo } });

        if (!student) return res.status(404).json({ message: "Student not found" });

        const book = await prisma.book.findUnique({ where: { id: bookId } });
        if (!book || book.available < 1) return res.status(400).json({ message: "Book not available" });

        await prisma.$transaction(async (tx) => {
            await tx.loan.create({
                data: {
                    bookId,
                    studentId: student?.id, // MongoDB ObjectId
                    dueDate: new Date(dueDate),
                    status: 'ISSUED'
                }
            });

            await tx.book.update({
                where: { id: bookId },
                data: { available: { decrement: 1 } }
            });
        });

        res.json({ message: "Book issued" });
    } catch (e) {
        console.error("Issue failed:", e);
        res.status(500).json({ error: "Issue failed" });
    }
};

// 6. RETURN BOOK
export const returnBook = async (req: AuthRequest, res: Response) => {
    try {
        const role = req.user?.role?.toUpperCase().replace(/_/g, ' ');
        if (role !== 'LIBRARIAN' && role !== 'SUPER ADMIN') return res.status(403).json({ message: "Denied" });

        const { loanId } = req.body; // loanId is a MongoDB ObjectId

        const loan = await prisma.loan.findUnique({ where: { id: loanId } });
        if (!loan || loan.status === 'RETURNED') return res.status(400).json({ message: "Invalid loan" });

        await prisma.$transaction(async (tx) => {
            await tx.loan.update({
                where: { id: loanId },
                data: { status: 'RETURNED', returnDate: new Date() }
            });

            await tx.book.update({
                where: { id: loan.bookId },
                data: { available: { increment: 1 } }
            });
        });

        res.json({ message: "Book returned" });
    } catch (e) {
        res.status(500).json({ error: "Return failed" });
    }
};