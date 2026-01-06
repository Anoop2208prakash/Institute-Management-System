// client/src/pages/admin/AdmissionList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaUserGraduate, FaSearch, FaPhone, FaEnvelope, FaIdBadge, FaTrash, FaPen, FaTimes } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton'; 
import { type AlertColor } from '@mui/material/Alert';
import './AdmissionList.scss'; 
import type { SelectChangeEvent } from '@mui/material';
import CustomSelect from '../../../components/common/CustomSelect';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';

interface Student {
  id: string; 
  admissionNo: string;
  name: string;
  email: string;
  class: string;
  classId?: string;
  phone: string | null;
  avatar: string | null;
  gender: string;
}

interface ClassOption {
  id: string;
  name: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (updatedData: Partial<Student>) => Promise<void>;
  isLoading: boolean;
}

const EditStudentModal: React.FC<EditModalProps> = ({ isOpen, onClose, student, onSave, isLoading }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', classId: '', gender: '' });
    const [classes, setClasses] = useState<ClassOption[]>([]);

    useEffect(() => {
        if (isOpen && student) {
            setFormData({
                name: student.name || '',
                phone: student.phone || '',
                classId: student.classId || '',
                gender: student.gender || 'MALE'
            });
        }
    }, [isOpen, student]); 

    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('token'); // ADDED: Get Token
            fetch('http://localhost:5000/api/classes', {
                headers: { 'Authorization': `Bearer ${token}` } // ADDED: Header
            })
                .then(res => res.json())
                .then(data => { if(Array.isArray(data)) setClasses(data); })
                .catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleGenderChange = (e: SelectChangeEvent<string | number>) => {
        setFormData({ ...formData, gender: e.target.value as string });
    };

    const handleClassChange = (e: SelectChangeEvent<string | number>) => {
        setFormData({ ...formData, classId: e.target.value as string });
    };

    const genderOptions = [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'OTHER', label: 'Other' }
    ];

    const classOptions = classes.map(c => ({
        value: c.id,
        label: c.name
    }));

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3><FaPen /> Edit Student</h3>
                    <button className="close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                            <div className="form-group" style={{flex:1}}>
                                <label>Phone</label>
                                <input 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                />
                            </div>
                            <div className="form-group" style={{flex:1}}>
                                <CustomSelect
                                    label="Gender"
                                    placeholder="Select Gender"
                                    value={formData.gender}
                                    onChange={handleGenderChange}
                                    options={genderOptions}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <CustomSelect
                                label="Class / Program"
                                placeholder="Select Class..."
                                value={formData.classId}
                                onChange={handleClassChange}
                                options={classOptions}
                                required={true}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdmissionList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ show: false, type: 'success', msg: '' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string, name: string } | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // ADDED: Get Token
      const res = await fetch('http://localhost:5000/api/students', {
        headers: { 'Authorization': `Bearer ${token}` } // ADDED: Header to fix 401
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setStudents(data);
      } else if (res.status === 401) {
        showAlert('error', 'Session expired. Please login again.');
      }
    } catch (error) {
      console.error(error);
      showAlert('error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleEditClick = (student: Student) => {
      setStudentToEdit(student);
      setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (updatedData: Partial<Student>) => {
      if (!studentToEdit) return;
      setIsProcessing(true);
      try {
          const token = localStorage.getItem('token'); // ADDED: Get Token
          const res = await fetch(`http://localhost:5000/api/students/${studentToEdit.id}`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` // ADDED: Header
              },
              body: JSON.stringify(updatedData)
          });

          if (res.ok) {
              showAlert('success', 'Student profile updated successfully');
              setIsEditModalOpen(false);
              fetchStudents(); 
          } else {
              const err = await res.json();
              showAlert('error', err.message || 'Update failed');
          }
      } catch (e) {
          showAlert('error', 'Network error during update');
      } finally {
          setIsProcessing(false);
      }
  };

  const openDeleteModal = (id: string, name: string) => {
    setStudentToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token'); // ADDED: Get Token
      const res = await fetch(`http://localhost:5000/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` } // ADDED: Header
      });

      if (res.ok) {
        fetchStudents(); 
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
      setIsProcessing(false);
    }
  };

  const filteredStudents = students
    .filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name)); 

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

      <div className="student-grid">
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
                        <div className="info-row"><FaIdBadge /> <span>ID: {s.admissionNo}</span></div>
                        <div className="info-row"><FaEnvelope /> <span title={s.email}>{s.email}</span></div>
                        <div className="info-row"><FaPhone /> <span>{s.phone || 'N/A'}</span></div>
                    </div>
                    <div className="card-footer">
                        <span className="gender-badge">{s.gender}</span>
                        <div className="actions">
                            <button className="btn-edit" onClick={() => handleEditClick(s)} title="Edit Student">
                                <FaPen />
                            </button>
                            <button className="btn-delete" onClick={() => openDeleteModal(s.id, s.name)} title="Remove Student">
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      <EditStudentModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={studentToEdit}
        onSave={handleUpdateStudent}
        isLoading={isProcessing}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message="Are you sure you want to permanently delete the record for"
        itemName={studentToDelete?.name || ''}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default AdmissionList;