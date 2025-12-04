// client/src/pages/admin/inventory/InventoryManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaBoxOpen, FaPlus, FaTrash, FaSearch, FaFileAlt } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './InventoryManager.scss';
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
  
  // --- TAB STATE ---
  const [activeTab, setActiveTab] = useState<'Uniform' | 'Stationery'>('Uniform');

  // Modal States
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

  // Filter based on Search AND Active Tab
  const filteredItems = items.filter(i => 
    i.category === activeTab && 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-page">
      
      {/* Header */}
      <div className="page-header">
         <h2><FaBoxOpen /> Inventory Manager</h2>
      </div>

      {/* Top Bar (Tabs & Search) */}
      <div className="top-bar">
        <div className="tabs">
            <button 
                className={`tab-btn ${activeTab === 'Uniform' ? 'active' : ''}`}
                onClick={() => setActiveTab('Uniform')}
            >
                Uniform
            </button>
            <button 
                className={`tab-btn ${activeTab === 'Stationery' ? 'active' : ''}`}
                onClick={() => setActiveTab('Stationery')}
            >
                Stationery
            </button>
        </div>

        <div className="actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="btn-add" onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus /> Add {activeTab}
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      {/* Data Table Container */}
      <div className="data-grid-container">
        
        {/* Table Header */}
        <div className="grid-header">
            <span>Item Name</span>
            <span>Quantity</span>
            <span>Price (₹)</span>
            <span>Actions</span>
        </div>

        <div className="grid-body">
            {/* Loader removed here */}

            {!isLoading && filteredItems.map(item => (
                <div key={item.id} className="grid-row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">{item.quantity} Units</span>
                    <span className="item-price">₹{item.price.toFixed(2)}</span>
                    <div className="actions">
                        <button onClick={() => setDeleteModal({show: true, id: item.id, name: item.name})}>
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {!isLoading && filteredItems.length === 0 && (
                <div className="empty-state">
                    <FaFileAlt className="icon" />
                    <p>Data not found!</p>
                </div>
            )}
        </div>
      </div>

      {/* Modals */}
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