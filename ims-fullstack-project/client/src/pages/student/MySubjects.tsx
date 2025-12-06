// client/src/pages/student/MySubjects.tsx
import React, { useState, useEffect } from 'react';
import { FaBook, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa';
import './MySubjects.scss';

interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  semester: string;
}

const MySubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/students/my-subjects', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setSubjects(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="my-subjects-page">
      <div className="page-header">
        <h2><FaBook /> My Subjects</h2>
        <p>List of subjects assigned to your current academic program.</p>
      </div>

      <div className="subjects-grid">
        {loading ? (
             // Simple loading text or spinner, since we removed LinearLoader from other pages
             <div className="empty-state">Loading subjects...</div>
        ) : subjects.length > 0 ? (
            subjects.map(sub => (
                <div key={sub.id} className="subject-card">
                    <div className="card-header">
                        <div className="icon-box"><FaBook /></div>
                        <span className="code-badge">{sub.code}</span>
                    </div>
                    
                    <div className="card-body">
                        <h3>{sub.name}</h3>
                        <div className="meta-row">
                            <FaChalkboardTeacher /> 
                            <span>Teacher: <strong>{sub.teacher}</strong></span>
                        </div>
                    </div>

                    <div className="card-footer">
                        <span className="semester-tag">
                            <FaCalendarAlt style={{marginRight:'4px'}}/> {sub.semester}
                        </span>
                    </div>
                </div>
            ))
        ) : (
            <div className="empty-state">
                <p>No subjects assigned yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default MySubjects;