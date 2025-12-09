// client/src/pages/admin/AdmissionList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaUserGraduate, FaSearch, FaPhone, FaEnvelope, FaIdBadge, FaTrash } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import Skeleton from '@mui/material/Skeleton'; // <--- Import Skeleton
import { type AlertColor } from '@mui/material/Alert';
import './AdmissionList.scss'; 

interface Student {
  id: string; 
  admissionNo: string;
  name: string;
  email: string;
  class: string;
  phone: string | null;
  avatar: string | null;
  gender: string;
}

const AdmissionList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Alert State
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/students');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setStudents(data);
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openDeleteModal = (id: string, name: string) => {
    setStudentToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        void fetchStudents(); 
        setIsDeleteModalOpen(false);
        showAlert('success', 'Student record deleted successfully');
      } else {
        const err = await res.json();
        showAlert('error', err.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Network error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admission-page"> 
      
      <div className="page-header">
        <div className="header-content">
            <h2><FaUserGraduate /> Student Admissions</h2>
            <p>Manage student records and enrollment.</p>
        </div>
        
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    type="text" 
                    placeholder="Search Name, ID, or Class..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <div className="count-badge" style={{background:'var(--card-bg-default)', padding:'0.5rem 1rem', borderRadius:'8px', border:'1px solid var(--card-border-color)', fontWeight:'600'}}>
                Total: {filteredStudents.length}
            </div>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      {/* Grid */}
      <div className="student-grid">
        
        {/* --- SKELETON LOADER --- */}
        {loading ? (
            Array.from(new Array(8)).map((_, index) => (
                <div key={index} className="student-card">
                    <div className="card-header">
                        <Skeleton variant="circular" width={80} height={80} style={{border: '4px solid var(--card-bg-default)'}} />
                        <Skeleton variant="rectangular" width={60} height={20} style={{borderRadius: '20px', marginTop: '10px'}} />
                    </div>
                    <div className="card-body">
                        <Skeleton variant="text" width="60%" height={30} style={{margin: '0 auto 10px'}} />
                        <div className="info-row" style={{justifyContent: 'center'}}><Skeleton variant="text" width="80%" /></div>
                        <div className="info-row" style={{justifyContent: 'center'}}><Skeleton variant="text" width="90%" /></div>
                        <div className="info-row" style={{justifyContent: 'center'}}><Skeleton variant="text" width="50%" /></div>
                    </div>
                    <div className="card-footer" style={{justifyContent: 'space-between'}}>
                         <Skeleton variant="text" width={40} />
                         <Skeleton variant="circular" width={30} height={30} />
                    </div>
                </div>
            ))
        ) : (
            filteredStudents.map(s => (
                <div key={s.id} className="student-card">
                    <div className="card-header">
                        <img 
                            src={s.avatar ? `http://localhost:5000${s.avatar}` : `https://ui-avatars.com/api/?name=${s.name}&background=random`} 
                            className="avatar" 
                            alt={s.name} 
                        />
                        <span className="class-badge" style={{backgroundColor: '#6f42c1'}}>
                            {s.class}
                        </span>
                    </div>
                    
                    <div className="card-body">
                        <h3>{s.name}</h3>
                        <div className="info-row">
                            <FaIdBadge /> <span>ID: {s.admissionNo}</span>
                        </div>
                        <div className="info-row">
                            <FaEnvelope /> <span>{s.email}</span>
                        </div>
                        <div className="info-row">
                            <FaPhone /> <span>{s.phone || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="card-footer">
                        <span className="gender-badge">{s.gender}</span>
                        
                        <button 
                            className="btn-delete" 
                            onClick={() => openDeleteModal(s.id, s.name)}
                            title="Remove Student"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            ))
        )}

        {!loading && filteredStudents.length === 0 && (
            <div className="empty-state">No students found.</div>
        )}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message="Are you sure you want to permanently delete the record for"
        itemName={studentToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdmissionList;