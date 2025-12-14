// client/src/components/admin/CreateSemesterModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import './CreateRoleModal.scss'; 
import type { SelectChangeEvent } from '@mui/material';
import CustomSelect from '../../../components/common/CustomSelect';

// 1. Export Interface
export interface SemesterFormData {
  name: string;
  classId: string; 
}

interface ProgramOption {
  id: string;
  name: string;
  description?: string;
}

interface CreateSemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SemesterFormData) => Promise<void>;
  isLoading: boolean;
}

export const CreateSemesterModal: React.FC<CreateSemesterModalProps> = ({
  isOpen, onClose, onSave, isLoading
}) => {
  const [formData, setFormData] = useState<SemesterFormData>({ 
    name: '', classId: '' 
  });
  
  const [programs, setPrograms] = useState<ProgramOption[]>([]);

  useEffect(() => {
    if (isOpen) {
        const token = localStorage.getItem('token'); 
        fetch('http://localhost:5000/api/classes', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPrograms(data);
            })
            .catch(err => console.error("Failed to load programs", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData({ name: '', classId: '' });
  };

  const programOptions = programs.map(prog => ({
    value: prog.id,
    label: prog.name
  }));

  const handleProgramChange = (e: SelectChangeEvent<string | number>) => {
    setFormData({ ...formData, classId: e.target.value as string });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaCalendarAlt /> Add New Semester</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Custom Select with Placeholder & Required */}
            <div className="form-group">
                <CustomSelect
                    label="Program / Class"
                    placeholder="Select Program..."
                    value={formData.classId}
                    onChange={handleProgramChange}
                    options={programOptions}
                    required={true}
                />
            </div>

            <div className="form-group">
                <label>Semester Name <span className="required">*</span></label>
                <input 
                    placeholder="e.g. Semester 1" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Semester'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};