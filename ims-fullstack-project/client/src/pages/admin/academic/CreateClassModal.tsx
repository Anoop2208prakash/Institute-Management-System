// client/src/components/admin/CreateClassModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaLayerGroup } from 'react-icons/fa';
import './CreateRoleModal.scss'; // Reuse styles

export interface ClassFormData {
  name: string;
  description: string;
}

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClassFormData) => Promise<void>;
  isLoading: boolean;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen, onClose, onSave, isLoading
}) => {
  const [formData, setFormData] = useState<ClassFormData>({ name: '', description: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaLayerGroup /> Add New Program</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
                <label>Program Name <span className="required">*</span></label>
                <input 
                    placeholder="e.g. Bachelor of Computer Science" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required autoFocus 
                />
            </div>
            
            <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                    placeholder="Short details about this program..." 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    rows={3}
                />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};