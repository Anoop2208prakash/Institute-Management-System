// client/src/pages/admin/academic/SubjectManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaBook, FaPlus, FaTrash, FaSearch, FaChalkboardTeacher, FaLayerGroup, FaCalendarAlt } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import LinearLoader from '../../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import './SubjectManager.scss'; // <--- Updated Import
import { CreateSubjectModal, type SubjectFormData } from './CreateSubjectModal';

interface Subject {
  id: string;
  name: string;
  code: string;
  className: string;
  teacherName: string;
  semesterName?: string; // Add this if your API returns it (updated controller does)
}

const SubjectManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, name: string}>({ show: false, id: '', name: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/subjects');
      if (res.ok) setSubjects(await res.json());
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchSubjects(); }, [fetchSubjects]);

  const handleCreate = async (data: SubjectFormData) => {
    setIsCreating(true);
    try {
        const res = await fetch('http://localhost:5000/api/subjects', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(res.ok) {
            void fetchSubjects();
            setIsCreateModalOpen(false);
            showAlert('success', 'Subject added successfully');
        } else {
            showAlert('error', 'Failed to add subject');
        }
    } catch(e) { 
        console.error(e);
        showAlert('error', 'Network error'); 
    } finally { 
        setIsCreating(false); 
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        const res = await fetch(`http://localhost:5000/api/subjects/${deleteModal.id}`, { method: 'DELETE' });
        if(res.ok) {
            void fetchSubjects();
            setDeleteModal({ show: false, id: '', name: '' });
            showAlert('success', 'Subject deleted');
        } else {
            showAlert('error', 'Failed to delete subject');
        }
    } catch(e) { 
        console.error(e);
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="subject-page"> 
      
      <div className="page-header">
        <div className="header-content">
            <h2><FaBook /> Manage Subjects</h2>
            <p>Assign subjects to programs, semesters, and teachers.</p>
        </div>
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search Subjects..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus /> Add Subject
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      {/* --- NEW HORIZONTAL LIST VIEW --- */}
      <div className="subject-list">
        {isLoading && <div style={{gridColumn:'1/-1', padding:'2rem', textAlign:'center'}}><LinearLoader /></div>}
        
        {!isLoading && filteredSubjects.map(sub => (
            <div key={sub.id} className="subject-row">
                {/* Left: Info */}
                <div className="row-left">
                    <div className="icon-box">
                        <FaBook />
                    </div>
                    <div className="info">
                        <h3>
                            {sub.name} 
                            <span className="code-badge">{sub.code}</span>
                        </h3>
                        <div className="details">
                            <span>
                                <FaLayerGroup style={{fontSize:'0.8rem', color:'var(--text-muted-color)'}}/> 
                                <strong>{sub.className}</strong>
                            </span>
                            
                            {sub.semesterName && (
                                <>
                                    <span className="separator">|</span>
                                    <span>
                                        <FaCalendarAlt style={{fontSize:'0.8rem', color:'var(--text-muted-color)'}}/> 
                                        {sub.semesterName}
                                    </span>
                                </>
                            )}

                            <span className="separator">|</span>
                            <span>
                                <FaChalkboardTeacher style={{fontSize:'0.8rem', color:'var(--text-muted-color)'}}/> 
                                <strong>{sub.teacherName}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="row-right">
                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: sub.id, name: sub.name})}>
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
        ))}

        {!isLoading && filteredSubjects.length === 0 && (
            <div className="empty-state">No subjects found.</div>
        )}
      </div>

      <CreateSubjectModal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSave={handleCreate} 
        isLoading={isCreating} 
      />

      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({...deleteModal, show: false})}
        onConfirm={handleDelete}
        title="Delete Subject"
        message="Are you sure you want to delete"
        itemName={deleteModal.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SubjectManager;