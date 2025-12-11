// server/src/routes/libraryRoutes.ts
import { Router } from 'express';
import { 
    getBooks, createBook, deleteBook, 
    getLoans, issueBook, returnBook 
} from '../controllers/libraryController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Books
router.get('/books', authenticate, getBooks); // All logged in users can view
router.post('/books', authenticate, createBook); // Librarian Only (Checked in controller)
router.delete('/books/:id', authenticate, deleteBook); // Librarian Only

// Loans
router.get('/loans', authenticate, getLoans);
router.post('/loans/issue', authenticate, issueBook);
router.post('/loans/return', authenticate, returnBook);

export default router;