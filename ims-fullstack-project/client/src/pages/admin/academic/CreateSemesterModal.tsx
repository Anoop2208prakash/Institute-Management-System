// client/src/components/admin/CreateSemesterModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import './CreateRoleModal.scss'; 

// Simplified Interface
interface SemesterFormData {
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
        fetch('http://localhost:5000/api/classes')
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

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaCalendarAlt /> Add New Semester</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Program Selector */}
            <div className="form-group">
                <label>Program / Class <span className="required">*</span></label>
                <select 
                    style={{padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--form-input-border-color)', background: 'var(--bg-color)', color: 'var(--font-color)'}}
                    value={formData.classId}
                    onChange={e => setFormData({...formData, classId: e.target.value})}
                    required
                    autoFocus
                >
                    <option value="">Select Program...</option>
                    {programs.map((prog) => (
                        <option key={prog.id} value={prog.id}>
                            {prog.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Semester Name */}
            <div className="form-group">
                <label>Semester Name <span className="required">*</span></label>
                <input 
                    placeholder="e.g. Semester 1" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                />
            </div>
            
            {/* Dates removed as requested */}

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