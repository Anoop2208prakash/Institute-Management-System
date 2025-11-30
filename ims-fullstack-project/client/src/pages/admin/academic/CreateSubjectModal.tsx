// client/src/components/admin/CreateSubjectModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaBook } from 'react-icons/fa';
import './CreateRoleModal.scss'; // Reusing styles

// 1. Define Form Data Interface
export interface SubjectFormData {
  name: string;
  code: string;
  classId: string;
  teacherId: string;
}

// 2. Define Data Interfaces for Dropdowns (The Fix)
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

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SubjectFormData) => Promise<void>;
  isLoading: boolean;
}

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen, onClose, onSave, isLoading
}) => {
  const [formData, setFormData] = useState<SubjectFormData>({ name: '', code: '', classId: '', teacherId: '' });
  
  // 3. Use Specific Interfaces instead of 'any[]'
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  // Fetch Classes & Teachers
  useEffect(() => {
    if (isOpen) {
        Promise.all([
            fetch('http://localhost:5000/api/classes').then(res => res.json()),
            fetch('http://localhost:5000/api/staff').then(res => res.json())
        ]).then(([classesData, staffData]) => {
            // Type Assertion for incoming API data
            if (Array.isArray(classesData)) {
                setClasses(classesData as ClassOption[]);
            }
            
            if (Array.isArray(staffData)) {
                // Filter only teachers
                const allStaff = staffData as TeacherOption[];
                const teacherList = allStaff.filter(s => s.role === 'Teacher');
                setTeachers(teacherList);
            }
        }).catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData({ name: '', code: '', classId: '', teacherId: '' }); // Reset
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
                        <option key={cls.id} value={cls.id}>{cls.name} ({cls.section})</option>
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