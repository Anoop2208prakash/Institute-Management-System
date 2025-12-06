// client/src/pages/student/MySubjects.tsx
import React, { useState, useEffect } from 'react';
import { FaBook, FaChalkboardTeacher, FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';
import './MySubjects.scss';
import { SubjectActionModal } from './SubjectActionModal';

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
  
  // Modal State
  const [selectedSubject, setSelectedSubject] = useState<{id: string, name: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCardClick = (sub: Subject) => {
      setSelectedSubject({ id: sub.id, name: sub.name });
      setIsModalOpen(true);
  };

  return (
    <div className="my-subjects-page">
      <div className="page-header">
        <h2><FaBook /> My Subjects</h2>
        <p>Click on a subject to view attendance and tests.</p>
      </div>

      <div className="subjects-grid">
        {loading ? (
             <div className="empty-state">Loading subjects...</div>
        ) : subjects.length > 0 ? (
            subjects.map(sub => (
                <div 
                    key={sub.id} 
                    className="subject-card" 
                    onClick={() => handleCardClick(sub)} 
                    style={{cursor: 'pointer'}}
                    title="Click to view details"
                >
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
                        {/* Visual indicator that this is clickable */}
                        <div style={{float:'right', color:'var(--primary-color)', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'4px', marginTop:'2px'}}>
                             Open <FaExternalLinkAlt style={{fontSize:'0.7rem'}}/>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="empty-state">
                <p>No subjects assigned yet.</p>
            </div>
        )}
      </div>

      {/* Render New Action Modal */}
      <SubjectActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject={selectedSubject}
      />
    </div>
  );
};

export default MySubjects;