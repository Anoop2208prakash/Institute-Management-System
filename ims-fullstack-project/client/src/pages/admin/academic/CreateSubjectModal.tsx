// client/src/components/admin/CreateSubjectModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaBook } from 'react-icons/fa';
import './CreateRoleModal.scss'; // Reusing styles
import type { SelectChangeEvent } from '@mui/material';
import CustomSelect from '../../../components/common/CustomSelect';

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

// Helper interface for raw API response
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
                // Filter only teachers
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
  
  // 1. Handle Class Change (Resets Semester)
  const handleClassChange = (e: SelectChangeEvent<string | number>) => {
    setFormData({
        ...formData,
        classId: e.target.value as string,
        semesterId: '' // Reset semester when class changes
    });
  };

  // 2. Generic Select Change
  const handleSelectChange = (field: keyof SubjectFormData) => (e: SelectChangeEvent<string | number>) => {
    setFormData({ ...formData, [field]: e.target.value as string });
  };

  // --- Transform Options ---
  
  // A. Class Options
  const classOptions = classes.map(cls => ({ 
      value: cls.id, 
      label: cls.name 
  }));

  // B. Teacher Options
  const teacherOptions = teachers.map(t => ({ 
      value: t.id, 
      label: t.name 
  }));

  // C. Filtered Semester Options
  const filteredSemesters = formData.classId 
    ? semesters.filter(sem => sem.classId === formData.classId)
    : [];

  const semesterOptions = filteredSemesters.map(sem => ({
      value: sem.id,
      label: sem.name
  }));

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaBook /> Add New Subject</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
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
            <button type="submit" className="btn-save" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Subject'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};