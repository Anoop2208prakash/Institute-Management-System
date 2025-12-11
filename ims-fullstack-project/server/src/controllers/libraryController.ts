// server/src/controllers/libraryController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// --- BOOK MANAGEMENT ---

// 1. GET ALL BOOKS (Public/Authenticated)
export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({ orderBy: { title: 'asc' } });
    res.json(books);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

// 2. ADD BOOK (Librarian & Super Admin Only)
export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'librarian' && role !== 'super_admin' && role !== 'admin') {
        return res.status(403).json({ message: "Access Denied: Librarians only" });
    }

    const { title, author, isbn, category, quantity } = req.body;

    // Check duplicate
    const existing = await prisma.book.findUnique({ where: { isbn } });
    if (existing) return res.status(400).json({ message: "Book with this ISBN already exists" });

    const newBook = await prisma.book.create({
      data: {
        title, author, isbn, category, 
        quantity: Number(quantity),
        available: Number(quantity) // Initially available = total
      }
    });

    res.status(201).json(newBook);
  } catch (e) {
    res.status(500).json({ error: "Failed to add book" });
  }
};

// 3. DELETE BOOK (Librarian & Super Admin Only)
export const deleteBook = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'librarian' && role !== 'super_admin') {
        return res.status(403).json({ message: "Access Denied" });
    }

    const { id } = req.params;
    await prisma.book.delete({ where: { id } });
    res.json({ message: "Book deleted" });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete book" });
  }
};

// --- LOAN MANAGEMENT ---

// 4. GET LOANS
export const getLoans = async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({
            include: { 
                book: true,
                student: true,
                teacher: true
            },
            orderBy: { issueDate: 'desc' }
        });

        const formatted = loans.map(l => ({
            id: l.id,
            bookTitle: l.book.title,
            studentName: l.student?.fullName || l.teacher?.fullName || 'Unknown',
            admissionNo: l.student?.admissionNo || l.teacher?.userId || 'N/A', // Using userId as ID for teacher
            dueDate: l.dueDate,
            status: l.status
        }));

        res.json(formatted);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch loans" });
    }
};

// 5. ISSUE BOOK
export const issueBook = async (req: AuthRequest, res: Response) => {
    try {
        const role = req.user?.role;
        if (role !== 'librarian' && role !== 'super_admin') return res.status(403).json({ message: "Denied" });

        const { bookId, admissionNo, dueDate } = req.body;

        // 1. Find Student/Teacher
        // Try student first
        let student = await prisma.student.findUnique({ where: { admissionNo } });
        let teacher = null;

        if (!student) {
            // Try teacher if not student (assuming logic exists to find teacher by some ID)
            // For simplicity, let's assume admissionNo might match a teacher's User ID or similar field
            // Or you might strictly require student ID for now.
             return res.status(404).json({ message: "Student not found" });
        }

        // 2. Check Book Availability
        const book = await prisma.book.findUnique({ where: { id: bookId } });
        if (!book || book.available < 1) return res.status(400).json({ message: "Book not available" });

        await prisma.$transaction(async (tx) => {
            // Create Loan
            await tx.loan.create({
                data: {
                    bookId,
                    studentId: student?.id,
                    dueDate: new Date(dueDate),
                    status: 'ISSUED'
                }
            });

            // Decrement Stock
            await tx.book.update({
                where: { id: bookId },
                data: { available: { decrement: 1 } }
            });
        });

        res.json({ message: "Book issued" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Issue failed" });
    }
};

// 6. RETURN BOOK
export const returnBook = async (req: AuthRequest, res: Response) => {
    try {
        const role = req.user?.role;
        if (role !== 'librarian' && role !== 'super_admin') return res.status(403).json({ message: "Denied" });

        const { loanId } = req.body;

        const loan = await prisma.loan.findUnique({ where: { id: loanId } });
        if (!loan || loan.status === 'RETURNED') return res.status(400).json({ message: "Invalid loan" });

        await prisma.$transaction(async (tx) => {
            // Update Loan
            await tx.loan.update({
                where: { id: loanId },
                data: { status: 'RETURNED', returnDate: new Date() }
            });

            // Increment Stock
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