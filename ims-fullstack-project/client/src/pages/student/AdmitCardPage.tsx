// client/src/pages/student/AdmitCardPage.tsx
import React, { useState, useEffect } from 'react';
import { FaPrint, FaUserGraduate } from 'react-icons/fa';
import './AdmitCardPage.scss'; 

interface StudentInfo {
  name: string;
  admissionNo: string;
  class: string;
  section: string | null;
  avatar: string | null; // <--- Added this type
}

interface ExamInfo {
  id: string;
  subject: string;
  code: string;
  date: string;
  semester: string;
  examName: string;
}

interface AdmitCardData {
  student: StudentInfo;
  exams: ExamInfo[];
}

const AdmitCardPage: React.FC = () => {
  const [data, setData] = useState<AdmitCardData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/students/admit-card', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then((responseData: AdmitCardData) => setData(responseData))
    .catch(console.error);
  }, []);

  if (!data) return <div style={{padding:'2rem', textAlign:'center'}}>Loading Admit Card...</div>;

  const { student, exams } = data;

  return (
    <div className="admit-card-page">
        
        <div className="admit-card" id="printable-area">
            
            <div className="header">
                <div className="institute-info">
                    <h1>IMS Institute</h1>
                    <p>Excellence in Education Since 1995</p>
                    <p>123 Education Lane, Knowledge City</p>
                </div>
                <div className="card-title">
                    <h2>Admit Card</h2>
                    <span>Session: 2025-2026</span>
                </div>
            </div>

            <div className="student-section">
                <div className="photo-box">
                    {/* FIX 2: Render Image if available, else placeholder */}
                    {student.avatar ? (
                        <img 
                            src={`http://localhost:5000${student.avatar}`} 
                            alt="Student" 
                            crossOrigin="anonymous" // Helps with some CORS issues on images
                        />
                    ) : (
                        <div className="placeholder"><FaUserGraduate /></div>
                    )}
                </div>
                
                <div className="info-grid">
                    <div className="info-group">
                        <label>Student Name</label>
                        <span>{student.name}</span>
                    </div>
                    <div className="info-group">
                        <label>Enrollment / ID</label>
                        <span>{student.admissionNo}</span>
                    </div>
                    <div className="info-group">
                        <label>Program / Class</label>
                        <span>{student.class}</span>
                    </div>
                    <div className="info-group">
                        <label>Section</label>
                        <span>{student.section || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="exam-section">
                <table>
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Semester</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.length > 0 ? exams.map((ex) => (
                            <tr key={ex.id}>
                                <td>{new Date(ex.date).toLocaleString([], {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</td>
                                <td>{ex.code}</td>
                                <td>{ex.subject}</td>
                                <td>{ex.semester}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} style={{textAlign:'center', padding:'2rem'}}>No exams scheduled yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card-footer">
                <div className="instructions">
                    <h4>Instructions:</h4>
                    <ul>
                        <li>Bring this admit card and a valid ID proof.</li>
                        <li>Report to the exam hall 30 minutes before time.</li>
                        <li>Electronic gadgets are strictly prohibited.</li>
                    </ul>
                </div>
                <div className="signature">
                    <div className="line"></div>
                    <span>Controller of Exams</span>
                </div>
            </div>
        </div>

        <div className="action-bar">
            <button onClick={() => window.print()}>
                <FaPrint /> Print Admit Card
            </button>
        </div>
    </div>
  );
};

export default AdmitCardPage;