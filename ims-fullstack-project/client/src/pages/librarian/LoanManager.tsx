// client/src/pages/librarian/LoanManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaClipboardList, FaUndo } from 'react-icons/fa';
import './LoanManager.scss'; // <--- UPDATED IMPORT

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

  // 2. Stabilized Fetch Function
  const fetchData = useCallback(async () => {
    try {
      const [loansRes, booksRes] = await Promise.all([
        fetch('http://localhost:5000/api/library/loans'),
        fetch('http://localhost:5000/api/library/books')
      ]);
      
      if (loansRes.ok) setLoans(await loansRes.json());
      if (booksRes.ok) setBooks(await booksRes.json());
    } catch (error) {
      console.error("Failed to load library data", error);
    }
  }, []);

  // 3. Safe Effect Call
  useEffect(() => { 
    const timer = setTimeout(() => { void fetchData(); }, 0);
    return () => clearTimeout(timer);
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
        setIssueData({ bookId: '', admissionNo: '', dueDate: '' }); // Reset
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

  // Helper to determine status class
  const getStatusClass = (status: string, dueDate: string) => {
      if (status === 'RETURNED') return 'returned';
      // Simple check for overdue if still issued
      if (new Date(dueDate) < new Date()) return 'overdue';
      return 'issued';
  };

  return (
    <div className="loan-page"> {/* Updated Class */}
      
      <div className="page-header">
        <div className="header-content">
          <h2><FaClipboardList /> Manage Loans</h2>
        </div>
        
        {/* Issue Book Form (Updated Classes) */}
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

      <div className="loans-grid"> {/* Updated Class */}
        {loans.map(loan => {
            const statusClass = getStatusClass(loan.status, loan.dueDate);
            
            return (
              <div key={loan.id} className={`loan-card ${loan.status.toLowerCase()}`}> {/* Dynamic Class */}
                <div className="card-content">
                  <h3>{loan.bookTitle}</h3>
                  <div className="student-info">
                    Student: <strong>{loan.studentName}</strong> 
                    <span>({loan.admissionNo})</span>
                  </div>
                  
                  <div className="due-date">
                    Due: {new Date(loan.dueDate).toLocaleDateString()}
                  </div>

                  {/* Status Badge */}
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
        })}
        
        {loans.length === 0 && (
            <div className="empty-state">No active or past loans found.</div>
        )}
      </div>
    </div>
  );
};

export default LoanManager;