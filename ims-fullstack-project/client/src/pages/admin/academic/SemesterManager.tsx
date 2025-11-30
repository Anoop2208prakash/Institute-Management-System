// client/src/pages/admin/academic/SemesterManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import LinearLoader from '../../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import './ClassManager.scss'; // Reuse ClassManager styles
import { CreateSemesterModal } from './CreateSemesterModal';

interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Define the form data interface here (or export from modal)
interface SemesterFormData {
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

const SemesterManager: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const fetchSemesters = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/semesters');
      if (res.ok) setSemesters(await res.json());
    } catch (e) {
      console.error(e); // FIX: Log the error
      showAlert('error', 'Failed to load semesters');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchSemesters(); }, [fetchSemesters]);

  const handleCreate = async (data: SemesterFormData) => {
    setIsCreating(true);
    try {
        const res = await fetch('http://localhost:5000/api/semesters', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(res.ok) {
            void fetchSemesters();
            setIsCreateModalOpen(false);
            showAlert('success', 'Semester created successfully');
        } else {
            showAlert('error', 'Failed to create semester');
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
        const res = await fetch(`http://localhost:5000/api/semesters/${deleteModal.id}`, { method: 'DELETE' });
        if(res.ok) {
            void fetchSemesters();
            setDeleteModal({ show: false, id: '', name: '' });
            showAlert('success', 'Semester deleted');
        } else {
            showAlert('error', 'Failed to delete semester');
        }
    } catch(e) { 
        console.error(e); // FIX: Log the error
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'ACTIVE': return { bg: 'rgba(26, 127, 55, 0.15)', text: '#1a7f37' }; // Green
          case 'COMPLETED': return { bg: 'var(--bg-secondary-color)', text: 'var(--text-muted-color)' }; // Gray
          default: return { bg: 'rgba(9, 105, 218, 0.15)', text: 'var(--primary-color)' }; // Blue
      }
  };

  return (
    <div className="class-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaCalendarAlt /> Manage Semesters</h2>
            <p>Define academic terms and timelines.</p>
        </div>
        <div className="header-actions">
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)} style={{padding:'0.6rem 1.2rem', background:'var(--btn-primary-bg)', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600}}>
                <FaPlus /> Add Semester
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="class-grid">
        {isLoading && <div style={{gridColumn:'1/-1'}}><LinearLoader /></div>}
        
        {semesters.map(sem => {
            const statusStyle = getStatusColor(sem.status);
            return (
                <div key={sem.id} className="class-card">
                    <div className="card-left">
                        <h3>{sem.name}</h3>
                        <div style={{fontSize:'0.85rem', color:'var(--text-muted-color)', marginTop:'5px'}}>
                            {formatDate(sem.startDate)} - {formatDate(sem.endDate)}
                        </div>
                    </div>
                    <div className="card-right">
                        <span className="section-badge" style={{backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: 'transparent'}}>
                            {sem.status}
                        </span>
                        <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: sem.id, name: sem.name})} style={{background:'none', border:'none', cursor:'pointer', color:'var(--font-color-danger)'}}>
                            <FaTrash />
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      <CreateSemesterModal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSave={handleCreate} 
        isLoading={isCreating} 
      />

      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({...deleteModal, show: false})}
        onConfirm={handleDelete}
        title="Delete Semester"
        message="Are you sure you want to delete"
        itemName={deleteModal.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SemesterManager;