// server/src/routes/libraryRoutes.ts
import { Router } from 'express';
import { 
    getBooks, createBook, deleteBook, 
    getLoans, issueBook, returnBook 
} from '../controllers/libraryController';
import { protect } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

// --- Books Management ---
/**
 * @route   GET /api/library/books
 * @desc    All logged-in users can view the library catalog
 */
router.get('/books', protect, getBooks); 

/**
 * @route   POST /api/library/books
 * @desc    Librarian Only: Add new books to the inventory
 */
router.post('/books', protect, createBook); 

/**
 * @route   DELETE /api/library/books/:id
 * @desc    Librarian Only: Remove books from the inventory
 */
router.delete('/books/:id', protect, deleteBook); 

// --- Loans & Circulation ---
/**
 * @route   GET /api/library/loans
 * @desc    Fetch active and historical book loans
 */
router.get('/loans', protect, getLoans);

/**
 * @route   POST /api/library/loans/issue
 * @desc    Issue a book to a student or teacher
 */
router.post('/loans/issue', protect, issueBook);

/**
 * @route   POST /api/library/loans/return
 * @desc    Process a book return
 */
router.post('/loans/return', protect, returnBook);

export default router;