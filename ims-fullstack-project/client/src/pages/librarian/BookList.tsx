// client/src/pages/librarian/BookList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaBook, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton'; // <--- Import Skeleton
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { DeleteModal } from '../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import { useAuth } from '../../context/AuthContext'; 
import './BookList.scss';
import { CreateBookModal } from './CreateBookModal';

// Interface for existing books from API
interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  quantity: number;
  available: number;
}

// Interface for NEW book data (from form)
interface NewBookData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
}

const BookList: React.FC = () => {
  const { user } = useAuth(); 
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Default to true for initial load
  const [searchTerm, setSearchTerm] = useState('');
  
  // Alert State
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{ id: string, title: string } | null>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check Permissions (Librarian or Super Admin)
  const canManage = user?.role === 'librarian' || user?.role === 'super_admin';

  // Helper
  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  // Fetch Books
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/library/books');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setBooks(data);
      }
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load books.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchBooks(); }, [fetchBooks]);

  // Create Logic
  const handleAddBook = async (bookData: NewBookData) => {
    setIsCreating(true);
    try {
        const res = await fetch('http://localhost:5000/api/library/books', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bookData)
        });
        if(res.ok) {
            void fetchBooks();
            setIsCreateModalOpen(false);
            showAlert('success', 'Book added successfully!');
        } else {
            showAlert('error', 'Failed to add book. ISBN might be duplicate.');
        }
    } catch(e) {
        console.error(e);
        showAlert('error', 'Network error.');
    } finally {
        setIsCreating(false);
    }
  };

  // Delete Logic
  const openDeleteModal = (id: string, title: string) => {
      setBookToDelete({ id, title });
      setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
      if(!bookToDelete) return;
      setIsDeleting(true);
      try {
          const res = await fetch(`http://localhost:5000/api/library/books/${bookToDelete.id}`, { method: 'DELETE' });
          if(res.ok) {
              void fetchBooks();
              setIsDeleteModalOpen(false);
              showAlert('success', 'Book deleted.');
          } else {
              showAlert('error', 'Failed to delete book.');
          }
      } catch(e) {
          console.error(e);
          showAlert('error', 'Network error.');
      } finally {
          setIsDeleting(false);
      }
  };

  // Search Logic
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="role-page">
      
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
            <h2><FaBook /> Library Catalog</h2>
            <p>Browse available resources and books.</p>
        </div>
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input placeholder="Search Title, Author, ISBN..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            
            {/* ONLY SHOW ADD BUTTON IF PERMISSION EXISTS */}
            {canManage && (
                <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <FaPlus /> Add Book
                </button>
            )}
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      {/* Grid */}
      <div className="roles-grid">
        
        {/* --- SKELETON LOADER --- */}
        {isLoading ? (
            Array.from(new Array(6)).map((_, index) => (
                <div key={index} className="role-card">
                    <div className="card-content">
                        {/* Title Skeleton */}
                        <Skeleton variant="text" width="80%" height={32} style={{marginBottom: 8}} />
                        {/* Author Skeleton */}
                        <Skeleton variant="text" width="50%" height={24} style={{marginBottom: 8}} />
                        {/* ISBN Skeleton */}
                        <Skeleton variant="text" width="40%" height={20} />
                        
                        {/* Stats Skeleton */}
                        <div style={{marginTop:'15px', display:'flex', gap:'15px'}}>
                            <Skeleton variant="text" width={60} height={20} />
                            <Skeleton variant="text" width={80} height={20} />
                        </div>
                    </div>
                    
                    {canManage && (
                        <div className="card-actions">
                            <Skeleton variant="rectangular" width="100%" height={36} style={{borderRadius: 6}} />
                        </div>
                    )}
                </div>
            ))
        ) : (
            filteredBooks.map(book => (
                <div key={book.id} className="role-card">
                    <div className="card-content">
                        <h3>{book.title}</h3>
                        <p style={{color:'var(--primary-color)', fontWeight:'bold', marginBottom:'0.5rem'}}>{book.author}</p>
                        <span className="role-id">ISBN: {book.isbn}</span>
                        <div style={{marginTop:'15px', display:'flex', gap:'15px', fontSize:'0.9rem', fontWeight:'500'}}>
                            <span style={{color:'var(--text-muted-color)'}}>Total: {book.quantity}</span>
                            <span style={{color: book.available > 0 ? '#1a7f37' : '#cf222e'}}>
                                Available: {book.available}
                            </span>
                        </div>
                    </div>
                    
                    {/* ONLY SHOW DELETE IF PERMISSION EXISTS */}
                    {canManage && (
                        <div className="card-actions">
                            <button className="delete-btn" onClick={() => openDeleteModal(book.id, book.title)}>
                                <FaTrash /> Delete Book
                            </button>
                        </div>
                    )}
                </div>
            ))
        )}

        {!isLoading && filteredBooks.length === 0 && <div className="empty-state"><p>No books found.</p></div>}
      </div>

      {/* Modals */}
      {canManage && (
        <>
            <CreateBookModal
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSave={handleAddBook} 
                isLoading={isCreating} 
            />

            <DeleteModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleConfirmDelete} 
                title="Delete Book" 
                message="Are you sure you want to delete" 
                itemName={bookToDelete?.title || ''} 
                isLoading={isDeleting} 
            />
        </>
      )}
    </div>
  );
};

export default BookList;