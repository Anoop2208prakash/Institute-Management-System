// client/src/pages/admin/academic/ExamManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaClipboardList, FaPlus, FaTrash, FaCalendarDay } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import LinearLoader from '../../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import './ClassManager.scss'; // Reuse styles
import { CreateExamModal, type ExamFormData } from './CreateExamModal';

interface Exam {
  id: string;
  name: string;
  date: string;
  className: string;
  subjectName: string;
  semesterName: string;
  status: string;
}

const ExamManager: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, name: string}>({ show: false, id: '', name: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ show: false, type: 'success', msg: '' });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchExams = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/exams');
      if (res.ok) setExams(await res.json());
    } catch (e) {
      console.error(e); // Log error to fix unused variable warning
      showAlert('error', 'Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchExams(); }, [fetchExams]);

  const handleCreate = async (data: ExamFormData) => {
    setIsCreating(true);
    try {
        const res = await fetch('http://localhost:5000/api/exams', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(res.ok) {
            void fetchExams();
            setIsCreateModalOpen(false);
            showAlert('success', 'Exam scheduled successfully');
        } else {
            showAlert('error', 'Failed to schedule exam');
        }
    } catch(e) { 
        console.error(e); // Log error
        showAlert('error', 'Network error'); 
    } finally { 
        setIsCreating(false); 
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        const res = await fetch(`http://localhost:5000/api/exams/${deleteModal.id}`, { method: 'DELETE' });
        if(res.ok) {
            void fetchExams();
            setDeleteModal({ show: false, id: '', name: '' });
            showAlert('success', 'Exam deleted');
        } else {
            showAlert('error', 'Failed to delete exam');
        }
    } catch(e) { 
        console.error(e); // Log error
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  const filteredExams = exams.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="class-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaClipboardList /> Manage Exams</h2>
            <p>Schedule exams, link subjects to semesters, and manage timelines.</p>
        </div>
        <div className="header-actions" style={{display:'flex', gap:'1rem'}}>
            <input 
                placeholder="Search Exams..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                style={{padding:'0.6rem', borderRadius:'6px', border:'1px solid var(--border-light-color)', background:'var(--bg-secondary-color)', color:'var(--font-color)'}}
            />
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)} style={{padding:'0.6rem 1.2rem', background:'var(--btn-primary-bg)', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600}}>
                <FaPlus /> Schedule Exam
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="class-grid">
        {isLoading && <div style={{gridColumn:'1/-1'}}><LinearLoader /></div>}
        
        {filteredExams.map(ex => (
            <div key={ex.id} className="class-card">
                <div className="card-left">
                    <h3>{ex.name}</h3>
                    <div style={{display:'flex', gap:'10px', marginTop:'5px', flexWrap:'wrap'}}>
                        <span className="section-badge" style={{background:'rgba(130, 80, 223, 0.1)', color:'#8250df', borderColor:'rgba(130, 80, 223, 0.3)'}}>{ex.semesterName}</span>
                        <span className="section-badge">{ex.className}</span>
                    </div>
                    <div style={{marginTop:'10px', fontSize:'0.9rem', color:'var(--text-muted-color)', display:'flex', alignItems:'center', gap:'8px'}}>
                        <FaCalendarDay /> {new Date(ex.date).toLocaleString()}
                    </div>
                    <p style={{fontSize:'0.9rem', marginTop:'5px', color:'var(--font-color)', fontWeight:500}}>{ex.subjectName}</p>
                </div>
                <div className="card-right">
                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: ex.id, name: ex.name})} style={{background:'none', border:'none', cursor:'pointer', color:'var(--font-color-danger)'}}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        ))}
      </div>

      <CreateExamModal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSave={handleCreate} 
        isLoading={isCreating} 
      />

      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({...deleteModal, show: false})}
        onConfirm={handleDelete}
        title="Delete Exam"
        message="Are you sure you want to delete"
        itemName={deleteModal.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ExamManager;