// client/src/components/admin/CreateRoleModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaShieldAlt } from 'react-icons/fa';
import './CreateRoleModal.scss';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: { displayName: string; description: string }) => Promise<void>;
  isLoading: boolean;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState({ displayName: '', description: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName) return;
    
    await onSave(formData);
    // Reset form after successful save
    setFormData({ displayName: '', description: '' });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h3><FaShieldAlt /> Create New Role</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Role Name <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="e.g. Accountant"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="What is this role for?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isLoading || !formData.displayName}>
              {isLoading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};