// client/src/pages/admin/academic/ClassManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaLayerGroup, FaPlus, FaTrash, FaUsers, FaSearch, FaGraduationCap } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './ClassManager.scss';
import { CreateClassModal, type ClassFormData } from './CreateClassModal';

interface ClassData {
  id: string;
  name: string;
  description: string | null; 
  _count?: {
    students: number;
  };
}

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/classes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setClasses(data);
      }
    } catch (e) {
      console.error(e); // FIX: Log the error
      showAlert('error', 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchClasses(); }, [fetchClasses]);

  const handleCreate = async (data: ClassFormData) => {
    setIsCreating(true);
    try {
        const res = await fetch('http://localhost:5000/api/classes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(res.ok) {
            void fetchClasses();
            setIsCreateModalOpen(false);
            showAlert('success', 'Class created successfully');
        } else {
            const err = await res.json();
            showAlert('error', err.message || 'Failed to create class');
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
        const res = await fetch(`http://localhost:5000/api/classes/${deleteModal.id}`, { method: 'DELETE' });
        if(res.ok) {
            void fetchClasses();
            setDeleteModal({ show: false, id: '', name: '' });
            showAlert('success', 'Class deleted');
        } else {
            const err = await res.json();
            showAlert('error', err.error || 'Cannot delete class with existing students.');
        }
    } catch(e) { 
        console.error(e); // FIX: Log the error
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  // Filter
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="class-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaLayerGroup /> Manage Programs</h2>
            <p>Configure academic classes, sections, and student groups.</p>
        </div>
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search Programs..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus /> Add Program
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="class-grid">
        {/* Loader Removed Here */}
        
        {filteredClasses.map(cls => (
            <div key={cls.id} className="class-card">
                <div className="card-top">
                    <div className="icon-wrapper">
                        <FaGraduationCap />
                    </div>
                    <div className="student-badge">
                        <FaUsers /> {cls._count?.students || 0}
                    </div>
                </div>
                
                <div className="card-content">
                    <h3>{cls.name}</h3>
                    {/* Description instead of Section */}
                    <p style={{fontSize:'0.9rem', color:'var(--text-muted-color)', marginTop:'5px', lineHeight: '1.4'}}>
                        {cls.description || "No description provided."}
                    </p>
                </div>

                <div className="card-actions">
                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: cls.id, name: cls.name})}>
                        <FaTrash /> Delete Class
                    </button>
                </div>
            </div>
        ))}

        {!isLoading && filteredClasses.length === 0 && (
            <div className="empty-state">
                <p>No classes found.</p>
            </div>
        )}
      </div>

      <CreateClassModal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSave={handleCreate} 
        isLoading={isCreating} 
      />

      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({...deleteModal, show: false})}
        onConfirm={handleDelete}
        title="Delete Class"
        message="Are you sure you want to delete"
        itemName={deleteModal.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ClassManager;