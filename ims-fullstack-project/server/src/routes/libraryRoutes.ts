// server/src/routes/libraryRoutes.ts
import { Router } from 'express';
import { 
    getBooks, createBook, 
    getLoans, issueBook, returnBook 
} from '../controllers/libraryController';
import { authenticate } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

// --- Books Management ---
/**
 * @route   GET /api/library/books
 * @desc    All logged-in users can view the library catalog
 */
router.get('/books', authenticate, getBooks); 

/**
 * @route   POST /api/library/books
 * @desc    Librarian Only: Add new books to the inventory
 */
router.post('/books', authenticate, createBook); 

/**
 * @route   DELETE /api/library/books/:id
 * @desc    Librarian Only: Remove books from the inventory
 */
router.delete('/books/:id', authenticate); 

// --- Loans & Circulation ---
/**
 * @route   GET /api/library/loans
 * @desc    Fetch active and historical book loans
 */
router.get('/loans', authenticate, getLoans);

/**
 * @route   POST /api/library/loans/issue
 * @desc    Issue a book to a student or teacher
 */
router.post('/loans/issue', authenticate, issueBook);

/**
 * @route   POST /api/library/loans/return
 * @desc    Process a book return
 */
router.post('/loans/return', authenticate, returnBook);

export default router;