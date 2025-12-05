// client/src/pages/teacher/MyClass.tsx
import React, { useState, useEffect } from 'react';
import { FaUsers, FaPhone } from 'react-icons/fa';
import './MyClass.scss'; 

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  avatar: string | null;
  phone: string | null;
}

interface ClassData {
    className: string;
    description: string;
    students: Student[];
}

const MyClass: React.FC = () => {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
        try {
            const token = localStorage.getItem('token');
            // Note: Ensure your backend server is running on port 5000
            const res = await fetch('http://localhost:5000/api/teacher/my-class', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if(res.ok) {
                const data = await res.json();
                // If the backend returns null (no class assigned), we handle it gracefully
                if (data) {
                    setClassData(data);
                } else {
                    setClassData(null);
                }
            }
        } catch(e) { 
            console.error("Failed to fetch class data", e); 
        } finally { 
            setLoading(false); 
        }
    };
    fetchClass();
  }, []);

  if (loading) return <div style={{padding:'2rem', textAlign:'center', color:'var(--text-muted-color)'}}>Loading Class Data...</div>;
  
  if (!classData) return (
    <div style={{padding:'3rem', textAlign:'center', color:'var(--text-muted-color)'}}>
        <h2>No Class Assigned</h2>
        <p>You have not been assigned as a class teacher yet.</p>
    </div>
  );

  return (
    <div className="class-page">
        <div className="page-header">
            <div className="header-content">
                <h2><FaUsers /> My Class: {classData.className}</h2>
                <p className="description">{classData.description || 'Class Overview'}</p>
            </div>
            <div className="header-actions">
                <span className="student-count-badge">
                    Total Students: {classData.students.length}
                </span>
            </div>
        </div>

        <div className="student-grid">
            {classData.students.map(s => (
                <div key={s.id} className="student-card">
                    <img 
                        src={s.avatar ? `http://localhost:5000${s.avatar}` : `https://ui-avatars.com/api/?name=${s.name}&background=random`} 
                        className="student-avatar"
                        alt={s.name}
                    />
                    <h3 className="student-name">{s.name}</h3>
                    <span className="student-id">{s.admissionNo}</span>
                    
                    <div className="student-info">
                        <FaPhone /> {s.phone || 'N/A'}
                    </div>
                </div>
            ))}

            {classData.students.length === 0 && (
                <div className="empty-state">No students found in this class.</div>
            )}
        </div>
    </div>
  );
};

export default MyClass;