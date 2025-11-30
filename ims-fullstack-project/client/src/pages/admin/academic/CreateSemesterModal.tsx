// client/src/components/admin/CreateSemesterModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import './CreateRoleModal.scss'; // Reusing generic modal styles

interface SemesterFormData {
  name: string;
  startDate: string;
  endDate: string;
  status: string;
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
    name: '', startDate: '', endDate: '', status: 'UPCOMING' 
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData({ name: '', startDate: '', endDate: '', status: 'UPCOMING' });
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
            <div className="form-group">
                <label>Semester Name <span className="required">*</span></label>
                <input 
                    placeholder="e.g. Spring 2025" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required autoFocus 
                />
            </div>
            
            <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <label>Start Date</label>
                    <input 
                        type="date" 
                        value={formData.startDate} 
                        onChange={e => setFormData({...formData, startDate: e.target.value})} 
                        required 
                    />
                </div>
                <div className="form-group" style={{flex:1}}>
                    <label>End Date</label>
                    <input 
                        type="date" 
                        value={formData.endDate} 
                        onChange={e => setFormData({...formData, endDate: e.target.value})} 
                        required 
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Status</label>
                <select 
                    style={{padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--form-input-border-color)', background: 'var(--bg-color)', color: 'var(--font-color)'}}
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Semester'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};