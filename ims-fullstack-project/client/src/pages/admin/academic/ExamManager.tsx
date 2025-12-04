// client/src/pages/admin/academic/ExamManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaClipboardList, FaPlus, FaTrash, FaSearch, FaCalendarDay } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './ExamManager.scss'; 
import { CreateExamModal, type ExamFormData } from './CreateExamModal';

interface Exam {
  id: string;
  name: string;
  date: string;
  className: string;
  subjectName: string;
  semesterName: string;
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
      console.error(e);
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
        console.error(e);
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
        console.error(e);
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
    <div className="exam-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaClipboardList /> Manage Exams</h2>
            <p>Schedule exams, link subjects to semesters, and manage timelines.</p>
        </div>
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search Exams..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus /> Schedule Exam
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="exam-list">
        {/* Loader Removed */}
        
        {!isLoading && filteredExams.map(ex => (
            <div key={ex.id} className="exam-row">
                <div className="row-left">
                    <div className="icon-box">
                        <FaClipboardList />
                    </div>
                    <div className="info">
                        <h3>{ex.name}</h3>
                        <div className="meta-badges">
                            <span>{ex.className}</span>
                            <span>{ex.semesterName}</span>
                            <span>{ex.subjectName}</span>
                        </div>
                    </div>
                </div>

                <div className="row-center">
                    <FaCalendarDay /> {new Date(ex.date).toLocaleString()}
                </div>

                <div className="row-right">
                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: ex.id, name: ex.name})}>
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
        ))}

        {!isLoading && filteredExams.length === 0 && (
            <div className="empty-state">No exams scheduled.</div>
        )}
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