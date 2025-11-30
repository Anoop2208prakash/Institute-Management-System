// server/src/controllers/libraryController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// --- BOOK MANAGEMENT ---

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({ orderBy: { title: 'asc' } });
    res.json(books);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch books' }); }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;
    const newBook = await prisma.book.create({
      data: { 
        title, author, isbn, category, 
        quantity: Number(quantity), 
        available: Number(quantity) // Initially all are available
      }
    });
    res.status(201).json(newBook);
  } catch (e) { res.status(500).json({ error: 'Failed to add book' }); }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    await prisma.book.delete({ where: { id: req.params.id } });
    res.json({ message: 'Book deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete book' }); }
};

// --- LOAN MANAGEMENT ---

export const getLoans = async (req: Request, res: Response) => {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        book: true,
        student: true 
      },
      orderBy: { issueDate: 'desc' }
    });
    
    // Format for frontend
    const formatted = loans.map(l => ({
        id: l.id,
        bookTitle: l.book.title,
        studentName: l.student.fullName,
        admissionNo: l.student.admissionNo,
        issueDate: l.issueDate,
        dueDate: l.dueDate,
        status: l.status,
        returnDate: l.returnDate
    }));
    res.json(formatted);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch loans' }); }
};

export const issueBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, admissionNo, dueDate } = req.body;

    // 1. Find Student
    const student = await prisma.student.findUnique({ where: { admissionNo } });
    if (!student) {
        res.status(404).json({ message: "Student not found" });
        return;
    }

    // 2. Check Book Availability
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.available < 1) {
        res.status(400).json({ message: "Book not available" });
        return;
    }

    // 3. Issue Book (Transaction)
    await prisma.$transaction(async (tx) => {
        // Create Loan Record
        await tx.loan.create({
            data: {
                bookId,
                studentId: student.id,
                dueDate: new Date(dueDate),
                status: 'ISSUED'
            }
        });

        // Decrease Availability
        await tx.book.update({
            where: { id: bookId },
            data: { available: { decrement: 1 } }
        });
    });

    res.status(201).json({ message: "Book issued successfully" });

  } catch (e) { 
      console.error(e);
      res.status(500).json({ error: 'Failed to issue book' }); 
  }
};

export const returnBook = async (req: Request, res: Response) => {
    try {
        const { loanId } = req.body;
        
        const loan = await prisma.loan.findUnique({ where: { id: loanId } });
        if(!loan || loan.status === 'RETURNED') return res.status(400).json({message: "Invalid loan"});

        await prisma.$transaction(async (tx) => {
            // Update Loan Status
            await tx.loan.update({
                where: { id: loanId },
                data: { status: 'RETURNED', returnDate: new Date() }
            });

            // Increase Availability
            await tx.book.update({
                where: { id: loan.bookId },
                data: { available: { increment: 1 } }
            });
        });

        res.json({ message: "Book returned" });
    } catch (e) { res.status(500).json({ error: 'Failed to return book' }); }
};