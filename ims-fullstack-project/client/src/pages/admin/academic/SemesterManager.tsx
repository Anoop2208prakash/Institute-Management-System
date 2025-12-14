// client/src/pages/admin/academic/SemesterManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaCalendarAlt, FaPlus, FaTrash, FaSearch, FaClock, 
  FaLayerGroup, FaArrowLeft, FaFolderOpen 
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './SemesterManager.scss'; 
import { CreateSemesterModal, type SemesterFormData } from './CreateSemesterModal';

// --- Interfaces ---
interface Semester {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string; 
  status: string;
  programName?: string;
  classId: string;
}

interface Program {
  id: string;
  name: string;
  description?: string;
  _count?: {
      semesters?: number;
  };
}

const SemesterManager: React.FC = () => {
  // Data States
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
   
  // Modal States
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

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [semRes, progRes] = await Promise.all([
          fetch('http://localhost:5000/api/semesters', { headers }),
          fetch('http://localhost:5000/api/classes', { headers })
      ]);

      if (semRes.ok && progRes.ok) {
          setSemesters(await semRes.json());
          setPrograms(await progRes.json());
      }
    } catch (e) {
      console.error(e); 
      showAlert('error', 'Failed to load academic data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // --- Actions ---
  const handleCreate = async (data: SemesterFormData) => {
    setIsCreating(true);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:5000/api/semesters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            void fetchData();
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
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/semesters/${deleteModal.id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            void fetchData();
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

  // --- Helpers ---
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'ACTIVE': return { bg: 'rgba(26, 127, 55, 0.15)', text: '#1a7f37' };
          case 'COMPLETED': return { bg: 'var(--bg-secondary-color)', text: 'var(--text-muted-color)' };
          default: return { bg: 'rgba(9, 105, 218, 0.15)', text: 'var(--primary-color)' };
      }
  };

  // --- Filtering ---
  const filteredPrograms = programs.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentSemesters = semesters.filter(s => {
      const matchesProgram = selectedProgram ? s.classId === selectedProgram.id : true;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.status.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesProgram && matchesSearch;
  });

  return (
    <div className="semester-page"> 
      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />
      
      {/* --- HEADER --- */}
      <div className="page-header">
        <div className="header-content">
            {selectedProgram ? (
                // View: Inside a Program
                <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                    <button className="back-btn-round" onClick={() => setSelectedProgram(null)}>
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h2>{selectedProgram.name}</h2>
                        <p>Managing semesters for this program</p>
                    </div>
                </div>
            ) : (
                // View: All Programs
                // FIX: Wrapped in div to stack vertical on mobile
                <div>
                    <h2><FaCalendarAlt /> Manage Semesters</h2>
                    <p>Select a program to view its semesters.</p>
                </div>
            )}
        </div>
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder={selectedProgram ? "Search Semesters..." : "Search Programs..."}
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus /> {selectedProgram ? "Add Semester" : "Add Semester"}
            </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="content-area">
        
        {isLoading ? (
            <div className="program-grid">
               {Array.from(new Array(4)).map((_, i) => (
                   <Skeleton key={i} variant="rectangular" height={140} style={{borderRadius: 16}} />
               ))}
            </div>
        ) : !selectedProgram ? (
            
            // VIEW 1: PROGRAM BOXES
            <div className="program-grid">
                {filteredPrograms.length > 0 ? (
                    filteredPrograms.map(prog => {
                        const semCount = semesters.filter(s => s.classId === prog.id).length;
                        return (
                            <div key={prog.id} className="program-box" onClick={() => {
                                setSelectedProgram(prog);
                                setSearchTerm('');
                            }}>
                                <div className="box-icon">
                                    <FaLayerGroup />
                                </div>
                                <div className="box-info">
                                    <h3>{prog.name}</h3>
                                    <p>{semCount} Semester{semCount !== 1 ? 's' : ''}</p>
                                </div>
                                <div className="box-arrow">
                                    <FaFolderOpen />
                                </div>
                            </div>
                        );
                    })
                ) : (
                   <div className="empty-state">No programs found.</div>
                )}
            </div>

        ) : (

            // VIEW 2: SEMESTER LIST
            <div className="semester-list">
                {currentSemesters.length > 0 ? (
                    currentSemesters.map(sem => {
                        const statusStyle = getStatusColor(sem.status);
                        return (
                            <div key={sem.id} className={`semester-row ${sem.status.toLowerCase()}`}>
                                <div className="row-left">
                                    <div className="icon-box">
                                        <FaCalendarAlt />
                                    </div>
                                    <div className="info">
                                        <h3>{sem.name}</h3>
                                        <div className="dates">
                                            <FaClock style={{fontSize:'0.8rem', color:'var(--primary-color)'}}/> 
                                            {formatDate(sem.startDate)} — {formatDate(sem.endDate)}
                                        </div>
                                    </div>
                                </div>

                                <div className="row-right">
                                    <span className={`status-badge ${sem.status.toLowerCase()}`} style={{color: statusStyle.text, backgroundColor: statusStyle.bg}}>
                                        {sem.status}
                                    </span>
                                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: sem.id, name: sem.name})}>
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <p>No semesters found for {selectedProgram.name}.</p>
                        <button className="link-btn" onClick={() => setIsCreateModalOpen(true)}>Create One?</button>
                    </div>
                )}
            </div>
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