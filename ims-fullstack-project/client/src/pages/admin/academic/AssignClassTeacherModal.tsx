// client/src/components/admin/AssignClassTeacherModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaChalkboardTeacher, FaCheck } from 'react-icons/fa';
import './AssignClassTeacherModal.scss'; 
import type { SelectChangeEvent } from '@mui/material';
import CustomSelect from '../../../components/common/CustomSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classData: { id: string; name: string; teacherId?: string | null };
  onSave: (classId: string, teacherId: string) => Promise<void>;
  isLoading: boolean;
}

interface TeacherOpt {
    id: string; 
    name: string;
}

export const AssignClassTeacherModal: React.FC<Props> = ({ isOpen, onClose, classData, onSave, isLoading }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(classData.teacherId || '');
  const [teachers, setTeachers] = useState<TeacherOpt[]>([]);

  useEffect(() => {
    if (isOpen) {
        setSelectedTeacher(classData.teacherId || '');
        // Fetch Teachers
        fetch('http://localhost:5000/api/staff')
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) {
                    // Filter raw users to find those with role 'Teacher'
                    const teacherList = data.filter((s:any) => s.role === 'Teacher').map((s:any) => ({
                        id: s.id,
                        name: s.name
                    }));
                    setTeachers(teacherList);
                }
            });
    }
  }, [isOpen, classData]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(classData.id, selectedTeacher);
  };

  // --- Transform Data for CustomSelect ---
  // Add a "None" option at the beginning
  const teacherOptions = [
      { value: '', label: '-- No Class Teacher --' },
      ...teachers.map(t => ({ value: t.id, label: t.name }))
  ];

  const handleTeacherChange = (e: SelectChangeEvent<string | number>) => {
      setSelectedTeacher(e.target.value as string);
  };

  if (!isOpen) return null;

  return (
    <div className="assign-modal-overlay">
      <div className="assign-modal-container">
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-box">
              <FaChalkboardTeacher />
            </div>
            <h3>Assign Class Teacher</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="modal-body">
                <p className="modal-subtitle">
                    Select a faculty member to oversee <strong>{classData.name}</strong>.
                </p>
                
                <div className="form-group">
                    <CustomSelect
                        label="Select Teacher"
                        placeholder="Select a teacher..."
                        value={selectedTeacher}
                        onChange={handleTeacherChange}
                        options={teacherOptions}
                        required={false}
                    />
                    <p className="helper-text" style={{marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted-color)'}}>
                        Note: This teacher will see this class in their "My Class" dashboard.
                    </p>
                </div>
            </div>

            <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-save" disabled={isLoading}>
                    {isLoading ? 'Saving...' : <><FaCheck /> Save Assignment</>}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};