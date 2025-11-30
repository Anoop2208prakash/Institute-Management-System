// client/src/components/admin/CreateInventoryModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaBoxOpen } from 'react-icons/fa';
import '../academic/ClassManager.scss'; // Reusing styles for consistency

// 1. Define Inventory Data Interface
export interface InventoryFormData {
  name: string;
  category: 'Uniform' | 'Stationery' | '';
  quantity: number;
  price: number;
}

interface CreateInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InventoryFormData) => Promise<void>;
  isLoading: boolean;
}

export const CreateInventoryModal: React.FC<CreateInventoryModalProps> = ({
  isOpen, onClose, onSave, isLoading
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({ 
    name: '', category: '', quantity: 0, price: 0 
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic Validation
    if (!formData.name || !formData.category) return;
    
    await onSave(formData);
    // Reset
    setFormData({ name: '', category: '', quantity: 0, price: 0 });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaBoxOpen /> Add Inventory Item</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select 
                    style={{
                        padding: '0.75rem', 
                        borderRadius: '6px', 
                        border: '1px solid var(--form-input-border-color)', 
                        background: 'var(--bg-color)', 
                        color: 'var(--font-color)'
                    }}
                    value={formData.category}
                    // Fix: Explicitly cast to specific string union type
                    onChange={e => setFormData({...formData, category: e.target.value as 'Uniform' | 'Stationery'})}
                    required
                >
                    <option value="" disabled>Select Type...</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Stationery">Stationery</option>
                </select>
            </div>

            <div className="form-group">
                <label>Item Name <span className="required">*</span></label>
                <input 
                    placeholder={formData.category === 'Uniform' ? "e.g. White Shirt Size M" : "e.g. Blue Ballpoint Pen"}
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                />
            </div>

            <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <label>Quantity</label>
                    <input 
                        type="number" 
                        min="0"
                        value={formData.quantity} 
                        onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} 
                        required 
                    />
                </div>
                <div className="form-group" style={{flex:1}}>
                    <label>Price (Each)</label>
                    <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
                        required 
                    />
                </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};