// client/src/components/admin/CreateClassModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaLayerGroup, FaCheck } from 'react-icons/fa';
import './CreateClassModal.scss'; 

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
    <div className="class-modal-overlay">
      <div className="class-modal-container">
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-box">
              <FaLayerGroup />
            </div>
            <h3>New Program</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-subtitle">Create a new academic program or class batch.</p>

            {/* Program Name */}
            <div className="form-group">
                <label>Program Name <span className="required">*</span></label>
                <input 
                    type="text"
                    placeholder="e.g. B.Tech Computer Science 2025" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                    autoFocus 
                />
            </div>
            
            {/* Description */}
            <div className="form-group">
                <label>Description</label>
                <textarea 
                    placeholder="Brief details about the curriculum or batch..." 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    rows={3}
                />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Creating...' : <><FaCheck /> Create Program</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};