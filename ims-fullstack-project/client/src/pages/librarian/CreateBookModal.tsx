// client/src/components/librarian/CreateBookModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaBook } from 'react-icons/fa';
import './CreateBookModal.scss'; 

// 1. Define the Interface for New Book Data
export interface NewBookData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
}

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 2. Use the Interface instead of 'any'
  onSave: (book: NewBookData) => Promise<void>;
  isLoading: boolean;
}

export const CreateBookModal: React.FC<CreateBookModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
}) => {
  // 3. Initialize state with proper types
  const [formData, setFormData] = useState<NewBookData>({
    title: '', 
    author: '', 
    isbn: '', 
    category: '', 
    quantity: 1
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.isbn) return;
    
    await onSave(formData);
    
    // Reset form
    setFormData({ title: '', author: '', isbn: '', category: '', quantity: 1 }); 
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaBook /> Add New Book</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Book Title <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="e.g. Clean Code" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
                autoFocus 
              />
            </div>
            
            <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <label>Author</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Robert C. Martin" 
                        value={formData.author} 
                        onChange={e => setFormData({...formData, author: e.target.value})} 
                        required 
                    />
                </div>
                <div className="form-group" style={{flex:1}}>
                    <label>ISBN <span className="required">*</span></label>
                    <input 
                        type="text" 
                        placeholder="Unique ID" 
                        value={formData.isbn} 
                        onChange={e => setFormData({...formData, isbn: e.target.value})} 
                        required 
                    />
                </div>
            </div>

            <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <label>Category</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Computer Science" 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})} 
                    />
                </div>
                <div className="form-group" style={{width:'100px'}}>
                    <label>Quantity</label>
                    <input 
                        type="number" 
                        min="1" 
                        value={formData.quantity} 
                        onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} 
                        required 
                    />
                </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
                Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};