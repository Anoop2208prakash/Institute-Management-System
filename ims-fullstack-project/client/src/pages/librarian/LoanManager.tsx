// client/src/pages/librarian/LoanManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaClipboardList, FaUndo, FaUserCircle } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton'; 
import { type AlertColor } from '@mui/material/Alert'; 
import FeedbackAlert from '../../components/common/FeedbackAlert'; 
import { DeleteModal } from '../../components/common/DeleteModal'; 
import './LoanManager.scss'; 

// 1. Define Interfaces
interface Book {
  id: string;
  title: string;
  available: number;
}

interface Loan {
  id: string;
  bookTitle: string;
  studentName: string;
  admissionNo: string;
  avatar: string | null; // FIXED: Added for Cloudinary integration
  dueDate: string;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
}

const LoanManager: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [issueData, setIssueData] = useState({ bookId: '', admissionNo: '', dueDate: '' });
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true); 
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ show: false, type: 'success', msg: '' });
  const [confirmReturnModal, setConfirmReturnModal] = useState<{show: boolean, loanId: string | null}>({ show: false, loanId: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [loansRes, booksRes] = await Promise.all([
        fetch('http://localhost:5000/api/library/loans'),
        fetch('http://localhost:5000/api/library/books')
      ]);
      
      if (loansRes.ok) setLoans(await loansRes.json());
      if (booksRes.ok) setBooks(await booksRes.json());
    } catch (error) {
      console.error("Failed to load library data", error);
      showAlert('error', "Failed to load library data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    void fetchData();
  }, [fetchData]);

  const handleIssue = async () => {
    if (!issueData.bookId || !issueData.admissionNo || !issueData.dueDate) {
        showAlert('warning', "Please fill in all fields: Book, Student ID, and Due Date.");
        return;
    }
    
    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:5000/api/library/loans/issue', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(issueData)
      });
      
      if (res.ok) {
        showAlert('success', "Book Issued Successfully");
        void fetchData(); 
        setIssueData({ bookId: '', admissionNo: '', dueDate: '' }); 
      } else {
        const err = await res.json();
        showAlert('error', `Failed to issue book: ${err.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      showAlert('error', "Network error occurred while issuing book.");
    } finally {
        setIsProcessing(false);
    }
  };

  const requestReturn = (loanId: string) => {
      setConfirmReturnModal({ show: true, loanId });
  };

  const handleConfirmReturn = async () => {
    const loanId = confirmReturnModal.loanId;
    if (!loanId) return;

    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:5000/api/library/loans/return', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ loanId })
      });
      
      if (res.ok) {
          showAlert('success', "Book marked as returned successfully.");
          void fetchData();
          setConfirmReturnModal({ show: false, loanId: null });
      } else {
          const err = await res.json();
          showAlert('error', `Failed to return book: ${err.message}`);
      }
    } catch (e) {
      console.error(e);
      showAlert('error', "Network error occurred during return process.");
    } finally {
        setIsProcessing(false);
    }
  };

  const getStatusClass = (status: string, dueDate: string) => {
      if (status === 'RETURNED') return 'returned';
      if (new Date(dueDate) < new Date()) return 'overdue';
      return 'issued';
  };

  return (
    <div className="loan-page"> 
      
      <FeedbackAlert 
        isOpen={alertInfo.show} 
        type={alertInfo.type} 
        message={alertInfo.msg} 
        onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
      />

      <DeleteModal 
        isOpen={confirmReturnModal.show}
        onClose={() => setConfirmReturnModal({ show: false, loanId: null })}
        onConfirm={handleConfirmReturn}
        title="Confirm Return"
        message="Are you sure you want to mark this book as returned?"
        itemName="this loan record"
        isLoading={isProcessing}
      />

      <div className="page-header">
        <div className="header-content">
          <h2><FaClipboardList /> Manage Loans</h2>
        </div>
        
        <div className="issue-form">
          <select 
            value={issueData.bookId}
            onChange={e => setIssueData({...issueData, bookId: e.target.value})} 
            disabled={isProcessing}
          >
            <option value="">Select Book...</option>
            {books.map((b) => (
              <option key={b.id} value={b.id} disabled={b.available < 1}>
                {b.title} {b.available < 1 ? '(Out of Stock)' : `(${b.available})`}
              </option>
            ))}
          </select>
          
          <input 
            placeholder="Student ID (Adm No)" 
            value={issueData.admissionNo}
            onChange={e => setIssueData({...issueData, admissionNo: e.target.value})} 
            disabled={isProcessing}
          />
          
          <input 
            type="date" 
            value={issueData.dueDate}
            onChange={e => setIssueData({...issueData, dueDate: e.target.value})} 
            disabled={isProcessing}
          />
          
          <button className="btn-issue" onClick={handleIssue} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Issue Book'}
          </button>
        </div>
      </div>

      <div className="loans-grid"> 
        
        {loading ? (
            Array.from(new Array(5)).map((_, index) => (
                <div key={index} className="loan-card">
                    <div className="card-content">
                        <Skeleton variant="text" width="80%" height={30} style={{marginBottom: 8}} />
                        <div style={{marginBottom: 15}}>
                            <Skeleton variant="text" width="60%" height={20} />
                            <Skeleton variant="text" width="40%" height={16} />
                        </div>
                        <Skeleton variant="text" width="50%" height={20} />
                        <Skeleton variant="rectangular" width={80} height={24} style={{borderRadius: 20, marginTop: 10}} />
                    </div>
                    <div className="card-actions">
                        <Skeleton variant="rectangular" width="100%" height={36} style={{borderRadius: 6}} />
                    </div>
                </div>
            ))
        ) : (
            loans.map(loan => {
                const statusClass = getStatusClass(loan.status, loan.dueDate);
                return (
                  <div key={loan.id} className={`loan-card ${loan.status.toLowerCase()}`}> 
                    <div className="card-content">
                      <h3>{loan.bookTitle}</h3>
                      
                      {/* FIXED: Added profile avatar section for borrowers */}
                      <div className="borrower-profile">
                        {loan.avatar ? (
                          <img 
                            src={loan.avatar} 
                            alt={loan.studentName} 
                            className="borrower-avatar"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${loan.studentName}&background=random`;
                            }}
                          />
                        ) : (
                          <FaUserCircle className="borrower-placeholder" />
                        )}
                        <div className="student-info">
                          Student: <strong>{loan.studentName}</strong> 
                          <span>({loan.admissionNo})</span>
                        </div>
                      </div>
                      
                      <div className="due-date">
                        Due: {new Date(loan.dueDate).toLocaleDateString()}
                      </div>

                      <span className={`status-badge ${statusClass}`}>
                        {statusClass === 'overdue' ? 'Overdue' : loan.status}
                      </span>
                    </div>

                    {loan.status === 'ISSUED' && (
                      <div className="card-actions">
                        <button className="return-btn" onClick={() => requestReturn(loan.id)}>
                          <FaUndo /> Return Book
                        </button>
                      </div>
                    )}
                  </div>
                );
            })
        )}
        
        {!loading && loans.length === 0 && (
            <div className="empty-state">No active or past loans found.</div>
        )}
      </div>
    </div>
  );
};

export default LoanManager;