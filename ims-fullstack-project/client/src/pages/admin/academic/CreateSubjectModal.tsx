// client/src/components/admin/CreateSubjectModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaBook } from 'react-icons/fa';
import './CreateRoleModal.scss'; // Reusing styles

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
        Promise.all([
            fetch('http://localhost:5000/api/classes').then(res => res.json()),
            fetch('http://localhost:5000/api/staff').then(res => res.json()),
            fetch('http://localhost:5000/api/semesters').then(res => res.json()) 
        ]).then(([classesData, staffData, semesterData]) => {
            if (Array.isArray(classesData)) setClasses(classesData);
            if (Array.isArray(semesterData)) setSemesters(semesterData);
            
            if (Array.isArray(staffData)) {
                // Explicitly type the filter and map
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

            <div className="form-group">
                <label>Assign Class <span className="required">*</span></label>
                <select 
                    style={{padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--form-input-border-color)', background: 'var(--bg-color)', color: 'var(--font-color)'}}
                    value={formData.classId}
                    onChange={e => setFormData({...formData, classId: e.target.value})}
                    required
                >
                    <option value="">Select Class...</option>
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                </select>
            </div>

            {/* --- NEW SEMESTER DROPDOWN --- */}
            <div className="form-group">
                <label>Semester (Optional)</label>
                <select 
                    style={{padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--form-input-border-color)', background: 'var(--bg-color)', color: 'var(--font-color)'}}
                    value={formData.semesterId}
                    onChange={e => setFormData({...formData, semesterId: e.target.value})}
                >
                    <option value="">All Semesters</option>
                    {semesters.map(sem => (
                        <option key={sem.id} value={sem.id}>
                            {sem.name} {sem.programName ? `(${sem.programName})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Assign Teacher (Optional)</label>
                <select 
                    style={{padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--form-input-border-color)', background: 'var(--bg-color)', color: 'var(--font-color)'}}
                    value={formData.teacherId}
                    onChange={e => setFormData({...formData, teacherId: e.target.value})}
                >
                    <option value="">Select Teacher...</option>
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option> 
                    ))}
                </select>
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