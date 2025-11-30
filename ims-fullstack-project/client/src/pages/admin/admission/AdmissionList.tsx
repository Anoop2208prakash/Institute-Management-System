// client/src/pages/admin/AdmissionList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaUserGraduate, FaSearch, FaPhone, FaEnvelope, FaIdBadge, FaTrash } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert'; // <--- Import Alert
import { DeleteModal } from '../../../components/common/DeleteModal'; // <--- Import Modal
import LinearLoader from '../../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import '../StaffList.scss'; // Reusing the grid styles

// 1. Interface Matches Backend Response
interface Student {
  id: string; // This corresponds to userId
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

  // Fetch Students
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

  // --- DELETE LOGIC ---
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
        void fetchStudents(); // Refresh list
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

  // Filter Logic
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="staff-page"> {/* Reusing Staff Page Layout */}
      
      <div className="page-header">
        <div className="header-content">
            <h2><FaUserGraduate /> Student Admissions</h2>
            <p>Manage student records and enrollment.</p>
        </div>
        
        {/* Search Box */}
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
      <div className="staff-grid">
        {loading && <div style={{gridColumn:'1/-1'}}><LinearLoader /></div>}
        
        {!loading && filteredStudents.map(s => (
            <div key={s.id} className="staff-card">
                <div className="card-header">
                    <img 
                        src={s.avatar ? `http://localhost:5000${s.avatar}` : `https://ui-avatars.com/api/?name=${s.name}&background=random`} 
                        className="avatar" 
                        alt={s.name} 
                    />
                    <span className="role-tag" style={{backgroundColor: '#6f42c1'}}>
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
                    <span className="date" style={{textTransform:'capitalize'}}>{s.gender.toLowerCase()}</span>
                    
                    {/* Delete Button */}
                    <button 
                        className="btn-delete" 
                        onClick={() => openDeleteModal(s.id, s.name)}
                        title="Remove Student"
                        style={{background:'none', border:'none', color:'var(--font-color-danger)', cursor:'pointer', fontSize:'1rem'}}
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        ))}

        {!loading && filteredStudents.length === 0 && (
            <div className="empty-state">No students found.</div>
        )}
      </div>

      {/* Delete Modal */}
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