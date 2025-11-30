// client/src/pages/admin/academic/ClassManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaLayerGroup, FaPlus, FaTrash, FaUsers } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './ClassManager.scss';

// Strictly Typed Interface matching Prisma response
interface ClassData {
  id: string;
  name: string;
  section: string;
  _count: {
    students: number;
  };
}

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  
  // Create Form State
  const [newClass, setNewClass] = useState({ name: '', section: '' });
  
  // Alert State
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, name: string}>({ 
    show: false, id: '', name: '' 
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
        if (Array.isArray(data)) {
            setClasses(data);
        }
      }
    } catch (e) {
      console.error(e); // Log error to fix unused var warning
      showAlert('error', 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchClasses(); }, [fetchClasses]);

  const handleCreate = async () => {
    if (!newClass.name || !newClass.section) {
        showAlert('warning', 'Please fill name and section');
        return;
    }
    try {
        const res = await fetch('http://localhost:5000/api/classes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newClass)
        });
        if(res.ok) {
            void fetchClasses();
            setNewClass({ name: '', section: '' });
            showAlert('success', 'Class created successfully');
        } else {
            const err = await res.json();
            showAlert('error', err.message || 'Failed to create class');
        }
    } catch(e) { 
        console.error(e); // FIX: Use the variable
        showAlert('error', 'Network error'); 
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
        console.error(e); // FIX: Use the variable
        showAlert('error', 'Network error'); 
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="class-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaLayerGroup /> Manage Programs (Classes)</h2>
            <p>Create and manage academic classes and sections.</p>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      {/* Creation Bar */}
      <div className="action-bar">
        <input 
            placeholder="Class Name (e.g. Grade 10)" 
            value={newClass.name} 
            onChange={e => setNewClass({...newClass, name: e.target.value})} 
        />
        <input 
            placeholder="Section (e.g. A, Science)" 
            value={newClass.section} 
            onChange={e => setNewClass({...newClass, section: e.target.value})} 
            style={{width: '150px'}}
        />
        <button onClick={handleCreate}><FaPlus /> Add Class</button>
      </div>

      {/* Grid */}
      <div className="class-grid">
        {isLoading && <p>Loading classes...</p>}
        
        {!isLoading && classes.map(cls => (
            <div key={cls.id} className="class-card">
                <div className="card-left">
                    <h3>{cls.name}</h3>
                    <span className="section-badge">{cls.section}</span>
                </div>
                <div className="card-right">
                    <div className="student-count">
                        <FaUsers /> {cls._count?.students || 0} Students
                    </div>
                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: cls.id, name: `${cls.name} - ${cls.section}`})}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        ))}
        
        {!isLoading && classes.length === 0 && <p>No classes found.</p>}
      </div>

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