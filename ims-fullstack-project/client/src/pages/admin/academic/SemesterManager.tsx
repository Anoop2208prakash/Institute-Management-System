// client/src/pages/admin/academic/SemesterManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import LinearLoader from '../../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import './SemesterManager.scss'; 
import { CreateSemesterModal } from './CreateSemesterModal';

// Updated Interface (Dates optional)
interface Semester {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: string;
  programName?: string; 
}

// Updated Form Interface
interface SemesterFormData {
  name: string;
  classId: string;
  // dates removed
}

const SemesterManager: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
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

  const fetchSemesters = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/semesters');
      if (res.ok) setSemesters(await res.json());
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load semesters');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchSemesters(); }, [fetchSemesters]);

  const handleCreate = async (data: SemesterFormData) => {
    setIsCreating(true);
    try {
        // Inject dates as null/dummy if needed, or update backend to ignore
        // Here we just send name/classId as defined in the new interface
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
        console.error(e);
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
        console.error(e);
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  // Filter Logic (Removed status search)
  const filteredSemesters = semesters.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.programName && s.programName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="semester-page"> 
      <div className="page-header">
        <div className="header-content">
            <h2><FaCalendarAlt /> Manage Semesters</h2>
            <p>Define academic terms and timelines.</p>
        </div>
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search Semesters..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus /> Add Semester
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="semester-list">
        {isLoading && <div style={{textAlign:'center', padding:'2rem'}}><LinearLoader /></div>}
        
        {!isLoading && filteredSemesters.map(sem => (
            <div key={sem.id} className="semester-row">
                {/* Left: Info */}
                <div className="row-left">
                    <div className="icon-box">
                        <FaCalendarAlt />
                    </div>
                    <div className="info">
                        <h3>{sem.name}</h3>
                        <span className="program">{sem.programName || 'General Program'}</span>
                    </div>
                </div>

                {/* Right: Actions (Status Removed) */}
                <div className="row-right">
                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: sem.id, name: sem.name})}>
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
        ))}

        {!isLoading && filteredSemesters.length === 0 && (
            <div className="empty-state">No semesters found.</div>
        )}
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