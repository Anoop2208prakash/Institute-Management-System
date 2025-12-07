// client/src/pages/student/MyResults.tsx
import React, { useState, useEffect } from 'react';
import { FaPenNib, FaTrophy, FaTimesCircle } from 'react-icons/fa';
// Removed LinearLoader import
import './MyResults.scss'; 

interface Result {
  id: string;
  examName: string;
  subject: string;
  semester: string;
  date: string;
  marks: number;
  total: number;
  grade: string;
}

const MyResults: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/students/my-results', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setResults(await res.json());
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const getGradeColor = (grade: string) => {
      return grade === 'PASS' ? '#1a7f37' : '#cf222e';
  };

  return (
    <div className="student-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaPenNib /> My Results</h2>
            <p>View your performance across all exams.</p>
        </div>
      </div>

      <div className="list-container">
            {/* Loader Removed */}
            
            {!loading && results.length > 0 ? results.map(result => (
                <div key={result.id} className="list-item">
                    <div className="item-left">
                        {result.grade === 'PASS' ? (
                            <FaTrophy style={{color: '#1a7f37', fontSize:'1.2rem'}} />
                        ) : (
                            <FaTimesCircle style={{color: '#cf222e', fontSize:'1.2rem'}} />
                        )}
                        <div className="details">
                            <span className="date">{result.examName}</span>
                            <span className="sub-text">{result.subject} ({result.semester})</span>
                        </div>
                    </div>
                    
                    <div style={{textAlign:'right'}}>
                        <span style={{display:'block', fontWeight:700, fontSize:'1.1rem'}}>
                            {result.marks} / {result.total}
                        </span>
                        <span style={{fontSize:'0.75rem', fontWeight:700, color: getGradeColor(result.grade)}}>
                            {result.grade}
                        </span>
                    </div>
                </div>
            )) : (
                !loading && <div className="empty-state">No results declared yet.</div>
            )}
        </div>
    </div>
  );
};

export default MyResults;