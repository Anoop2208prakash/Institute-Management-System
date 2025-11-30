// client/src/pages/admin/inventory/InventoryManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaBoxOpen, FaPlus, FaTrash, FaTshirt, FaPen } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import LinearLoader from '../../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import '../academic/ClassManager.scss';
import { CreateInventoryModal, type InventoryFormData } from './CreateInventoryModal';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, name: string}>({ show: false, id: '', name: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ show: false, type: 'success', msg: '' });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/inventory');
      if (res.ok) setItems(await res.json());
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  // FIX: Use explicit type for 'data'
  const handleCreate = async (data: InventoryFormData) => {
    setIsCreating(true);
    try {
        const res = await fetch('http://localhost:5000/api/inventory', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(res.ok) {
            void fetchItems();
            setIsCreateModalOpen(false);
            showAlert('success', 'Item added successfully');
        } else {
            showAlert('error', 'Failed to add item');
        }
    } catch(e) { 
        console.error(e);
        showAlert('error', 'Network error'); 
    } finally { 
        setIsCreating(false); 
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        const res = await fetch(`http://localhost:5000/api/inventory/${deleteModal.id}`, { method: 'DELETE' });
        if(res.ok) {
            void fetchItems();
            setDeleteModal({ show: false, id: '', name: '' });
            showAlert('success', 'Item deleted');
        } else {
            showAlert('error', 'Failed to delete item');
        }
    } catch(e) { 
        console.error(e);
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="class-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaBoxOpen /> Manage Inventory</h2>
            <p>Track stocks of Uniforms and Stationery.</p>
        </div>
        <div className="header-actions" style={{display:'flex', gap:'1rem'}}>
            <input 
                placeholder="Search Items..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                style={{padding:'0.6rem', borderRadius:'6px', border:'1px solid var(--border-light-color)', background:'var(--bg-secondary-color)', color:'var(--font-color)'}}
            />
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)} style={{padding:'0.6rem 1.2rem', background:'var(--btn-primary-bg)', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600}}>
                <FaPlus /> Add Item
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="class-grid">
        {isLoading && <div style={{gridColumn:'1/-1'}}><LinearLoader /></div>}
        
        {filteredItems.map(item => (
            <div key={item.id} className="class-card">
                <div className="card-left">
                    <h3>{item.name}</h3>
                    <div style={{display:'flex', gap:'10px', marginTop:'5px', alignItems:'center'}}>
                        {/* Dynamic Icon based on Category */}
                        {item.category === 'Uniform' 
                            ? <FaTshirt style={{color:'#0969da'}} /> 
                            : <FaPen style={{color:'#d29922'}} />
                        }
                        <span className="section-badge">{item.category}</span>
                    </div>
                    <p style={{fontSize:'0.9rem', color:'var(--font-color)', marginTop:'8px', fontWeight:600}}>
                        ${item.price.toFixed(2)}
                    </p>
                </div>
                <div className="card-right">
                    <div className="student-count" style={{color: item.quantity < 10 ? '#cf222e' : 'var(--font-color)'}}>
                        Qty: {item.quantity}
                    </div>
                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: item.id, name: item.name})} style={{background:'none', border:'none', cursor:'pointer', color:'var(--font-color-danger)'}}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        ))}
      </div>

      <CreateInventoryModal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSave={handleCreate} 
        isLoading={isCreating} 
      />

      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({...deleteModal, show: false})}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete"
        itemName={deleteModal.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default InventoryManager;