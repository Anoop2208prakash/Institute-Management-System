// server/src/routes/libraryRoutes.ts
import { Router } from 'express';
import { getBooks, createBook, deleteBook, getLoans, issueBook, returnBook } from '../controllers/libraryController';

const router = Router();

// Books
router.get('/books', getBooks);
router.post('/books', createBook);
router.delete('/books/:id', deleteBook);

// Loans
router.get('/loans', getLoans);
router.post('/loans/issue', issueBook);
router.post('/loans/return', returnBook);

export default router;