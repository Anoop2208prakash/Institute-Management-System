// client/src/components/admin/CreateAnnouncementModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaBullhorn } from 'react-icons/fa';
import '../CreateRoleModal.scss'; // Reuse styles

export interface AnnouncementData {
  title: string;
  content: string;
  target: 'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AnnouncementData) => Promise<void>;
  isLoading: boolean;
}

export const CreateAnnouncementModal: React.FC<Props> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState<AnnouncementData>({ 
    title: '', content: '', target: 'ALL' 
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData({ title: '', content: '', target: 'ALL' });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaBullhorn /> Post New Announcement</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input 
                    placeholder="e.g. Holiday Notice" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required autoFocus 
                />
            </div>
            
            <div className="form-group">
                <label>Target Audience</label>
                <select 
                    style={{
                        padding:'0.75rem', 
                        borderRadius:'6px', 
                        border:'1px solid var(--form-input-border-color)', 
                        background:'var(--bg-color)', 
                        color:'var(--font-color)'
                    }}
                    value={formData.target}
                    // FIX: Cast to the specific union type
                    onChange={e => setFormData({...formData, target: e.target.value as AnnouncementData['target']})}
                >
                    <option value="ALL">Everyone</option>
                    <option value="STUDENT">Students Only</option>
                    <option value="TEACHER">Teachers Only</option>
                    <option value="ADMIN">Admins Only</option>
                </select>
            </div>

            <div className="form-group">
                <label>Content <span className="required">*</span></label>
                <textarea 
                    placeholder="Write your message here..." 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    required 
                    rows={5}
                />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};