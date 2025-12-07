// client/src/pages/teacher/TeacherSubjects.tsx
import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaUsers, FaBook, FaSearch } from 'react-icons/fa';
import LinearLoader from '../../components/common/LinearLoader';
import './TeacherSubjects.scss';
import { TeacherSubjectActionModal } from './TeacherSubjectActionModal';

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  avatar: string | null;
}

interface SubjectData {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    classId: string;
    className: string;
    students: Student[];
}

const TeacherSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/teacher/my-subjects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if(res.ok) {
                setSubjects(await res.json());
            }
        } catch(e) { 
            console.error("Failed to fetch subjects", e); 
        } finally { 
            setLoading(false); 
        }
    };
    fetchSubjects();
  }, []);

  // Filter Logic
  const filteredSubjects = subjects.filter(sub => 
    sub.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="teacher-subjects-page">
        <div className="page-header">
            <div className="header-content">
                <h2><FaChalkboardTeacher /> My Subjects</h2>
            </div>
            
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search Subjects..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {loading ? <div style={{padding:'2rem'}}><LinearLoader /></div> : (
            <div className="subjects-grid">
                {filteredSubjects.length > 0 ? filteredSubjects.map(sub => (
                    <div 
                        key={sub.subjectId} 
                        className="subject-card" 
                        onClick={() => setSelectedSubject(sub)} // Open Action Modal
                        style={{cursor: 'pointer'}}
                        title="Click to view actions"
                    >
                        <div className="card-header">
                            <div className="icon-box"><FaBook /></div>
                            <span className="student-count"><FaUsers /> {sub.students.length}</span>
                        </div>
                        <div className="card-body">
                            <h3>{sub.subjectName}</h3>
                            <span className="class-name">{sub.className}</span>
                            <span className="code">{sub.subjectCode}</span>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">No subjects found.</div>
                )}
            </div>
        )}

        {/* New Action Modal */}
        <TeacherSubjectActionModal
            isOpen={!!selectedSubject}
            onClose={() => setSelectedSubject(null)}
            subject={selectedSubject}
        />
    </div>
  );
};

export default TeacherSubjects;