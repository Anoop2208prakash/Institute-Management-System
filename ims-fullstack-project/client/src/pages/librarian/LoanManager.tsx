// client/src/pages/librarian/LoanManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaClipboardList, FaUndo } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton'; // <--- Import Skeleton
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
  dueDate: string;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
}

const LoanManager: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [issueData, setIssueData] = useState({ bookId: '', admissionNo: '', dueDate: '' });
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true); // Added loading state

  // 2. Fetch Function
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
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Safe Effect Call
  useEffect(() => { 
    void fetchData();
  }, [fetchData]);

  const handleIssue = async () => {
    if (!issueData.bookId || !issueData.admissionNo || !issueData.dueDate) {
        alert("Please fill all fields");
        return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/library/loans/issue', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(issueData)
      });
      
      if (res.ok) {
        alert("Book Issued Successfully");
        void fetchData(); 
        setIssueData({ bookId: '', admissionNo: '', dueDate: '' }); 
      } else {
        const err = await res.json();
        alert(`Failed: ${err.message}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReturn = async (loanId: string) => {
    if (!window.confirm("Mark this book as returned?")) return;
    try {
      const res = await fetch('http://localhost:5000/api/library/loans/return', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ loanId })
      });
      if (res.ok) void fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusClass = (status: string, dueDate: string) => {
      if (status === 'RETURNED') return 'returned';
      if (new Date(dueDate) < new Date()) return 'overdue';
      return 'issued';
  };

  return (
    <div className="loan-page"> 
      
      <div className="page-header">
        <div className="header-content">
          <h2><FaClipboardList /> Manage Loans</h2>
        </div>
        
        <div className="issue-form">
          <select 
            value={issueData.bookId}
            onChange={e => setIssueData({...issueData, bookId: e.target.value})} 
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
          />
          
          <input 
            type="date" 
            value={issueData.dueDate}
            onChange={e => setIssueData({...issueData, dueDate: e.target.value})} 
          />
          
          <button className="btn-issue" onClick={handleIssue}>Issue Book</button>
        </div>
      </div>

      <div className="loans-grid"> 
        
        {/* --- SKELETON LOADER --- */}
        {loading ? (
            Array.from(new Array(5)).map((_, index) => (
                <div key={index} className="loan-card">
                    <div className="card-content">
                        {/* Title Skeleton */}
                        <Skeleton variant="text" width="80%" height={30} style={{marginBottom: 8}} />
                        
                        {/* Student Info Skeleton */}
                        <div style={{marginBottom: 15}}>
                            <Skeleton variant="text" width="60%" height={20} />
                            <Skeleton variant="text" width="40%" height={16} />
                        </div>
                        
                        {/* Due Date Skeleton */}
                        <Skeleton variant="text" width="50%" height={20} />

                        {/* Status Badge Skeleton */}
                        <Skeleton variant="rectangular" width={80} height={24} style={{borderRadius: 20, marginTop: 10}} />
                    </div>
                    {/* Action Button Skeleton */}
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
                      <div className="student-info">
                        Student: <strong>{loan.studentName}</strong> 
                        <span>({loan.admissionNo})</span>
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
                        <button className="return-btn" onClick={() => handleReturn(loan.id)}>
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