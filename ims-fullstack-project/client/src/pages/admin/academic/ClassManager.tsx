// client/src/pages/admin/academic/ClassManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaLayerGroup, FaPlus, FaTrash, FaUsers, FaSearch, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './ClassManager.scss';
import { CreateClassModal, type ClassFormData } from './CreateClassModal';
import { AssignClassTeacherModal } from './AssignClassTeacherModal';

interface ClassData {
  id: string;
  name: string;
  description: string | null; 
  teacherId?: string | null; 
  teacher?: { fullName: string }; 
  _count?: {
    students: number;
  };
}

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, name: string}>({ show: false, id: '', name: '' });
  const [assignModal, setAssignModal] = useState<{show: boolean, data: any}>({ show: false, data: {} }); 

  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false); 
  
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
      console.error(e);
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
        console.error(e);
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
        console.error(e);
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  const handleAssignTeacher = async (classId: string, teacherUserId: string) => {
    setIsAssigning(true);
    try {
        const res = await fetch(`http://localhost:5000/api/classes/${classId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ teacherId: teacherUserId })
        });
        if(res.ok) {
            void fetchClasses();
            setAssignModal({ show: false, data: {} });
            showAlert('success', 'Class teacher assigned');
        } else {
            showAlert('error', 'Failed to assign teacher');
        }
    } catch(e) { 
        console.error(e);
        showAlert('error', 'Network error'); 
    } finally { 
        setIsAssigning(false); 
    }
  };

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
        {/* --- SKELETON LOADER --- */}
        {isLoading ? (
            Array.from(new Array(4)).map((_, i) => (
                <div key={i} className="class-card">
                    <div className="card-top">
                        <Skeleton variant="circular" width={50} height={50} style={{borderRadius: 12}} />
                        <Skeleton variant="rectangular" width={60} height={24} style={{borderRadius: 20}} />
                    </div>
                    <div className="card-content">
                        <Skeleton variant="text" width="60%" height={32} style={{marginBottom: 8}} />
                        <Skeleton variant="text" width="90%" height={20} />
                        <Skeleton variant="text" width="80%" height={20} />
                        
                        <div style={{marginTop:'15px', display:'flex', alignItems:'center', gap:'10px'}}>
                            <Skeleton variant="circular" width={20} height={20} />
                            <Skeleton variant="text" width="120px" height={20} />
                        </div>
                    </div>
                    <div className="card-actions">
                        <Skeleton variant="rectangular" width={100} height={36} style={{borderRadius: 6}} />
                        <Skeleton variant="rectangular" width={100} height={36} style={{borderRadius: 6}} />
                    </div>
                </div>
            ))
        ) : (
            filteredClasses.map(cls => (
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
                        <p style={{fontSize:'0.9rem', color:'var(--text-muted-color)', marginTop:'5px', lineHeight: '1.4'}}>
                            {cls.description || "No description provided."}
                        </p>

                        <div style={{marginTop:'15px', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'6px', color: cls.teacher ? 'var(--primary-color)' : 'var(--text-muted-color)', fontWeight:500}}>
                            <FaChalkboardTeacher /> 
                            {cls.teacher ? cls.teacher.fullName : 'No Class Teacher Assigned'}
                        </div>
                    </div>

                    <div className="card-actions">
                        <button className="delete-btn" style={{color:'var(--font-color)', border:'1px solid var(--border-light-color)'}} onClick={() => setAssignModal({show:true, data: cls})}>
                            Assign Teacher
                        </button>

                        <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: cls.id, name: cls.name})}>
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>
            ))
        )}

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

      <AssignClassTeacherModal
        isOpen={assignModal.show}
        onClose={() => setAssignModal({show: false, data: {}})}
        classData={assignModal.data}
        onSave={handleAssignTeacher}
        isLoading={isAssigning}
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