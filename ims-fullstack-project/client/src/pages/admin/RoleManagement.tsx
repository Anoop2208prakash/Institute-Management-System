// client/src/pages/admin/RoleManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaTrash, FaShieldAlt, FaPlus, FaLock, FaUserTag, FaSearch } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton'; // <--- Import Skeleton
import { DeleteModal } from '../../components/common/DeleteModal';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import './RoleManagement.scss';
import { CreateRoleModal } from './CreateRoleModal';
import type { AlertColor } from '@mui/material';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: AlertColor;
    msg: string;
  }>({ 
    show: false, 
    type: 'success', 
    msg: '' 
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string, name: string } | null>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const SYSTEM_ROLES = new Set(['super_admin', 'admin', 'teacher', 'student']);

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/roles');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (Array.isArray(data)) setRoles(data);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Could not load roles from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchRoles(); }, [fetchRoles]);

  const handleCreate = async (newRoleData: { displayName: string; description: string }) => {
    setIsCreating(true);
    try {
      const res = await fetch('http://localhost:5000/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoleData)
      });
      if (res.ok) {
        void fetchRoles();
        setIsCreateModalOpen(false); 
        showAlert('success', 'New role created successfully!');
      } else {
        showAlert('error', 'Failed to create role. Name might be duplicate.');
      }
    } catch (error) {
      console.error("Create Role Error:", error);
      showAlert('error', 'Network error while creating role.');
    } finally {
      setIsCreating(false);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setRoleToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/roles/${roleToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        void fetchRoles();
        setIsDeleteModalOpen(false);
        showAlert('success', `Role "${roleToDelete.name}" deleted.`);
      } else {
        showAlert('error', 'Failed to delete role.');
      }
    } catch (error) {
      console.error("Delete Role Error:", error);
      showAlert('error', 'Network error while deleting role.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="role-page">
      
      <div className="page-header">
        <div className="header-content">
          <h2><FaShieldAlt /> Role Management</h2>
          <p>Define access levels and manage user permissions.</p>
        </div>

        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    type="text" 
                    placeholder="Search roles..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
            <FaPlus /> Create New Role
            </button>
        </div>
      </div>

      <FeedbackAlert 
        isOpen={alertInfo.show} 
        type={alertInfo.type} 
        message={alertInfo.msg} 
        onClose={() => setAlertInfo({ ...alertInfo, show: false })}
      />

      <div className="roles-grid">
        
        {/* --- SKELETON LOADER --- */}
        {isLoading ? (
             Array.from(new Array(6)).map((_, i) => (
                 <div key={i} className="role-card">
                     <div className="card-top" style={{display: 'flex', justifyContent: 'space-between'}}>
                         <Skeleton variant="circular" width={40} height={40} />
                         <Skeleton variant="rectangular" width={60} height={20} style={{borderRadius: 10}} />
                     </div>
                     <div className="card-content">
                         <Skeleton variant="text" width="60%" height={32} style={{marginBottom: 8}} />
                         <Skeleton variant="text" width="40%" height={20} style={{marginBottom: 12}} />
                         <Skeleton variant="text" width="90%" height={20} />
                         <Skeleton variant="text" width="80%" height={20} />
                     </div>
                     <div className="card-actions">
                         <Skeleton variant="rectangular" width="100%" height={36} style={{borderRadius: 6}} />
                     </div>
                 </div>
             ))
        ) : (
             filteredRoles.length > 0 ? filteredRoles.map((role) => {
                const isSystem = SYSTEM_ROLES.has(role.name);
                return (
                    <div key={role.id} className="role-card">
                    <div className="card-top">
                        <div className={`icon-wrapper ${isSystem ? 'system' : 'custom'}`}>
                        {isSystem ? <FaLock /> : <FaUserTag />}
                        </div>
                        {isSystem && <span className="badge system">System Default</span>}
                    </div>

                    <div className="card-content">
                        <h3>{role.displayName}</h3>
                        <span className="role-id">ID: {role.name}</span>
                        <p>{role.description || "No description provided."}</p>
                    </div>

                    <div className="card-actions">
                        {isSystem ? (
                        <button className="lock-btn" title="Cannot delete system role">
                            <FaLock /> Protected
                        </button>
                        ) : (
                        <button className="delete-btn" onClick={() => openDeleteModal(role.id, role.displayName)}>
                            <FaTrash /> Delete Role
                        </button>
                        )}
                    </div>
                    </div>
                );
             }) : (
                 <div className="empty-state">
                     <p>No roles found matching "{searchTerm}"</p>
                 </div>
             )
        )}
      </div>

      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
        isLoading={isCreating}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message="Are you sure you want to delete the role"
        itemName={roleToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RoleManagement;