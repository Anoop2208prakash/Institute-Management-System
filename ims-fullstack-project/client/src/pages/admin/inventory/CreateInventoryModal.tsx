// client/src/components/admin/CreateInventoryModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaBoxOpen, FaCheck } from 'react-icons/fa';
import type { SelectChangeEvent } from '@mui/material';
import CustomSelect from '../../../components/common/CustomSelect';
import './CreateInventoryModal.scss'; // Dedicated SCSS

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
    if (!formData.name || !formData.category) return;
    
    await onSave(formData);
    setFormData({ name: '', category: '', quantity: 0, price: 0 });
  };

  const handleCategoryChange = (e: SelectChangeEvent<string | number>) => {
    setFormData({ ...formData, category: e.target.value as 'Uniform' | 'Stationery' });
  };

  const categoryOptions = [
    { value: 'Uniform', label: 'Uniform' },
    { value: 'Stationery', label: 'Stationery' }
  ];

  return (
    <div className="inventory-modal-overlay">
      <div className="inventory-modal-container">
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-box">
              <FaBoxOpen />
            </div>
            <h3>Add Inventory Item</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-subtitle">Add new stock to the school inventory system.</p>
            
            {/* Category Select */}
            <div className="form-group">
                <CustomSelect
                    label="Category"
                    placeholder="Select Type..."
                    value={formData.category}
                    onChange={handleCategoryChange}
                    options={categoryOptions}
                    required={true}
                />
            </div>

            {/* Item Name */}
            <div className="form-group">
                <label>Item Name <span className="required">*</span></label>
                <input 
                    type="text"
                    placeholder={formData.category === 'Uniform' ? "e.g. White Shirt Size M" : "e.g. Blue Ballpoint Pen"}
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                    autoFocus
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
                    <label>Price (₹)</label>
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
                {isLoading ? 'Adding...' : <><FaCheck /> Add Item</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};