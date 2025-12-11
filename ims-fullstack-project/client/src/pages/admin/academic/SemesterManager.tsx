// client/src/pages/admin/academic/SemesterManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaPlus, FaTrash, FaSearch, FaClock } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './SemesterManager.scss'; 
import { CreateSemesterModal } from './CreateSemesterModal';

interface Semester {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string; 
  status: string;
  programName?: string;
}

interface SemesterFormData {
  name: string;
  classId: string;
}

const SemesterManager: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'ACTIVE': return { bg: 'rgba(26, 127, 55, 0.15)', text: '#1a7f37' };
          case 'COMPLETED': return { bg: 'var(--bg-secondary-color)', text: 'var(--text-muted-color)' };
          default: return { bg: 'rgba(9, 105, 218, 0.15)', text: 'var(--primary-color)' };
      }
  };

  const filteredSemesters = semesters.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
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
        
        {/* --- SKELETON LOADER --- */}
        {isLoading ? (
            Array.from(new Array(5)).map((_, index) => (
                <div key={index} className="semester-row" style={{padding: '1.5rem'}}>
                    <div className="row-left" style={{gap: '1rem', width: '100%'}}>
                        <Skeleton variant="rectangular" width={50} height={50} style={{borderRadius: 12}} />
                        <div style={{flex: 1}}>
                            <Skeleton variant="text" width="60%" height={24} style={{marginBottom: 6}} />
                            <Skeleton variant="text" width="40%" height={16} />
                        </div>
                    </div>
                    <div className="row-right" style={{gap: '1rem', width: '30%'}}>
                        <Skeleton variant="rectangular" width={80} height={24} style={{borderRadius: 12}} />
                        <Skeleton variant="rectangular" width={80} height={32} style={{borderRadius: 6}} />
                    </div>
                </div>
            ))
        ) : (
            filteredSemesters.map(sem => {
                const statusStyle = getStatusColor(sem.status);
                return (
                    <div key={sem.id} className={`semester-row ${sem.status.toLowerCase()}`}>
                        {/* Left: Info */}
                        <div className="row-left">
                            <div className="icon-box">
                                <FaCalendarAlt />
                            </div>
                            <div className="info">
                                <h3>{sem.name}</h3>
                                <span className="program">{sem.programName || 'General Program'}</span>
                                <div className="dates">
                                    <FaClock style={{fontSize:'0.8rem', color:'var(--primary-color)'}}/> 
                                    {formatDate(sem.startDate)} — {formatDate(sem.endDate)}
                                </div>
                            </div>
                        </div>

                        {/* Right: Status & Actions */}
                        <div className="row-right">
                            <span className={`status-badge ${sem.status.toLowerCase()}`} style={{color: statusStyle.text, backgroundColor: statusStyle.bg, borderColor: 'transparent'}}>
                                {sem.status}
                            </span>
                            <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: sem.id, name: sem.name})}>
                                <FaTrash /> Delete
                            </button>
                        </div>
                    </div>
                );
            })
        )}

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