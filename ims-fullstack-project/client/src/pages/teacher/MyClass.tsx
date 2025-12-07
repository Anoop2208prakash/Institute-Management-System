// client/src/pages/teacher/MyClass.tsx
import React, { useState, useEffect } from 'react';
import { FaUsers, FaPhone, FaChalkboardTeacher } from 'react-icons/fa';
import './MyClass.scss'; 

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  avatar: string | null;
  phone: string | null;
}

interface ClassData {
    id: string;
    className: string;
    description: string;
    roleType: string; // "Class Teacher" or "Subject: Math"
    students: Student[];
}

const MyClass: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/teacher/my-class', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if(res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setClasses(data);
                    setSelectedClassId(data[0].id); // Select first class by default
                } else {
                    setClasses([]);
                }
            }
        } catch(e) { 
            console.error("Failed to fetch class data", e); 
        } finally { 
            setLoading(false); 
        }
    };
    fetchClasses();
  }, []);

  // Get currently selected class object
  const currentClass = classes.find(c => c.id === selectedClassId);

  if (loading) return <div style={{padding:'2rem', textAlign:'center', color:'var(--text-muted-color)'}}>Loading Class Data...</div>;
  
  if (classes.length === 0) return (
    <div style={{padding:'3rem', textAlign:'center', color:'var(--text-muted-color)'}}>
        <h2>No Classes Assigned</h2>
        <p>You have not been assigned to any classes or subjects yet.</p>
    </div>
  );

  return (
    <div className="class-page">
        <div className="page-header">
            <div className="header-content">
                <h2><FaUsers /> My Class</h2>
                
                {/* --- CLASS SELECTOR --- */}
                <div style={{marginTop:'0.5rem', display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{color:'var(--text-muted-color)', fontSize:'0.9rem'}}>Viewing:</span>
                    <select 
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        style={{
                            padding: '0.5rem', borderRadius: '6px', 
                            border: '1px solid var(--card-border-color)', 
                            background: 'var(--card-bg-default)', color: 'var(--font-color)',
                            fontSize: '1rem', fontWeight: '600'
                        }}
                    >
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.className} ({c.roleType})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="header-actions">
                <span className="student-count-badge">
                    Total Students: {currentClass?.students.length || 0}
                </span>
            </div>
        </div>

        {/* Sub-Header Info */}
        <div style={{marginBottom:'1.5rem', color:'var(--primary-color)', fontWeight:'500', display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <FaChalkboardTeacher /> Role: {currentClass?.roleType}
        </div>

        <div className="student-grid">
            {currentClass?.students.map(s => (
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

            {currentClass?.students.length === 0 && (
                <div className="empty-state">No students found in this class.</div>
            )}
        </div>
    </div>
  );
};

export default MyClass;