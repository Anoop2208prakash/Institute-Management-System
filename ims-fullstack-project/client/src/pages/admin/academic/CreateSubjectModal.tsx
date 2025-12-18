// client/src/components/admin/CreateSubjectModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaBook, FaCheck } from 'react-icons/fa';
import type { SelectChangeEvent } from '@mui/material';
import CustomSelect from '../../../components/common/CustomSelect';
import './CreateSubjectModal.scss'; // Dedicated SCSS

// 1. Define Interfaces
export interface SubjectFormData {
  name: string;
  code: string;
  classId: string;
  teacherId: string;
  semesterId: string; 
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
}

interface TeacherOption {
  id: string;
  name: string;
  role: string;
}

interface SemesterOption {
  id: string;
  name: string;
  classId?: string; 
  programName?: string;
}

interface RawStaff {
    id: string;
    name: string;
    role: string;
}

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SubjectFormData) => Promise<void>;
  isLoading: boolean;
}

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen, onClose, onSave, isLoading
}) => {
  const [formData, setFormData] = useState<SubjectFormData>({ 
    name: '', code: '', classId: '', teacherId: '', semesterId: '' 
  });
  
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);

  // Fetch Data
  useEffect(() => {
    if (isOpen) {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        Promise.all([
            fetch('http://localhost:5000/api/classes', { headers }).then(res => res.json()),
            fetch('http://localhost:5000/api/staff', { headers }).then(res => res.json()),
            fetch('http://localhost:5000/api/semesters', { headers }).then(res => res.json()) 
        ]).then(([classesData, staffData, semesterData]) => {
            if (Array.isArray(classesData)) setClasses(classesData);
            if (Array.isArray(semesterData)) setSemesters(semesterData);
            
            if (Array.isArray(staffData)) {
                const teacherList = (staffData as RawStaff[])
                    .filter(s => s.role === 'Teacher')
                    .map(t => ({
                        id: t.id,
                        name: t.name,
                        role: t.role
                    }));
                setTeachers(teacherList);
            }
        }).catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData({ name: '', code: '', classId: '', teacherId: '', semesterId: '' }); 
  };

  // --- Handlers ---
  const handleClassChange = (e: SelectChangeEvent<string | number>) => {
    setFormData({
        ...formData,
        classId: e.target.value as string,
        semesterId: '' 
    });
  };

  const handleSelectChange = (field: keyof SubjectFormData) => (e: SelectChangeEvent<string | number>) => {
    setFormData({ ...formData, [field]: e.target.value as string });
  };

  // --- Options ---
  const classOptions = classes.map(cls => ({ value: cls.id, label: cls.name }));
  const teacherOptions = teachers.map(t => ({ value: t.id, label: t.name }));
  
  const filteredSemesters = formData.classId 
    ? semesters.filter(sem => sem.classId === formData.classId)
    : [];

  const semesterOptions = filteredSemesters.map(sem => ({ value: sem.id, label: sem.name }));

  return (
    <div className="subject-modal-overlay">
      <div className="subject-modal-container">
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-box">
              <FaBook />
            </div>
            <h3>Add New Subject</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-subtitle">Define a new course or subject for a specific curriculum.</p>
            
            <div className="form-group">
                <label>Subject Name <span className="required">*</span></label>
                <input 
                    placeholder="e.g. Advanced Mathematics" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                    autoFocus 
                />
            </div>
            
            <div className="form-group">
                <label>Subject Code <span className="required">*</span></label>
                <input 
                    placeholder="e.g. MTH-101" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})} 
                    required 
                />
            </div>

            {/* --- CUSTOM SELECT: CLASS --- */}
            <div className="form-group">
                <CustomSelect
                    label="Assign Class / Program"
                    placeholder="Select Class first..."
                    value={formData.classId}
                    onChange={handleClassChange}
                    options={classOptions}
                    required={true}
                />
            </div>

            {/* --- CUSTOM SELECT: SEMESTER --- */}
            <div className="form-group">
                <CustomSelect 
                    label="Semester (Optional)"
                    placeholder={formData.classId ? "Select Semester..." : "Select Class first"}
                    value={formData.semesterId}
                    onChange={handleSelectChange('semesterId')}
                    options={semesterOptions}
                    disabled={!formData.classId}
                />
            </div>

            {/* --- CUSTOM SELECT: TEACHER --- */}
            <div className="form-group">
                <CustomSelect 
                    label="Assign Teacher (Optional)"
                    placeholder="Select Teacher..."
                    value={formData.teacherId}
                    onChange={handleSelectChange('teacherId')}
                    options={teacherOptions}
                />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Saving...' : <><FaCheck /> Save Subject</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};