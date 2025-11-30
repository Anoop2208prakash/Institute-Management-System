// client/src/pages/admin/academic/SubjectManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaBook, FaPlus, FaTrash } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import LinearLoader from '../../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import './ClassManager.scss'; // Reusing ClassManager styles for consistency
import { CreateSubjectModal, type SubjectFormData } from './CreateSubjectModal';

interface Subject {
  id: string;
  name: string;
  code: string;
  className: string;
  teacherName: string;
}

const SubjectManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States
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
      console.error(e); // FIX: Log the error
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
        console.error(e); // FIX: Log the error
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
        console.error(e); // FIX: Log the error
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  // Filter
  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="class-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaBook /> Manage Subjects</h2>
            <p>Assign subjects to classes and teachers.</p>
        </div>
        <div className="header-actions" style={{display:'flex', gap:'1rem'}}>
            <input 
                placeholder="Search Subjects..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                style={{padding:'0.6rem', borderRadius:'6px', border:'1px solid var(--border-light-color)', background:'var(--bg-secondary-color)', color:'var(--font-color)'}}
            />
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)} style={{padding:'0.6rem 1.2rem', background:'var(--btn-primary-bg)', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600}}>
                <FaPlus /> Add Subject
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="class-grid">
        {isLoading && <div style={{gridColumn:'1/-1'}}><LinearLoader /></div>}
        
        {filteredSubjects.map(sub => (
            <div key={sub.id} className="class-card">
                <div className="card-left">
                    <h3>{sub.name}</h3>
                    <div style={{display:'flex', gap:'10px', marginTop:'5px'}}>
                        <span className="section-badge">{sub.code}</span>
                        <span className="section-badge" style={{background:'rgba(210, 153, 34, 0.15)', color:'#d29922', borderColor:'rgba(210, 153, 34, 0.3)'}}>{sub.className}</span>
                    </div>
                    <p style={{fontSize:'0.85rem', color:'var(--text-muted-color)', marginTop:'8px'}}>
                        Teacher: {sub.teacherName}
                    </p>
                </div>
                <div className="card-right">
                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: sub.id, name: sub.name})} style={{background:'none', border:'none', cursor:'pointer', color:'var(--font-color-danger)'}}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        ))}
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