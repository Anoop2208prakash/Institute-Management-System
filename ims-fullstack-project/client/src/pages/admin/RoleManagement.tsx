// client/src/pages/admin/RoleManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaTrash, FaShieldAlt, FaPlus, FaLock, FaUserTag } from 'react-icons/fa';
import { DeleteModal } from '../../components/common/DeleteModal';
import './RoleManagement.scss';
import { CreateRoleModal } from './CreateRoleModal';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string, name: string } | null>(null);
  
  // Loading States for Actions
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const SYSTEM_ROLES = ['super_admin', 'admin', 'teacher', 'student'];

  // Fetch Roles
  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/roles');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (Array.isArray(data)) setRoles(data);
    } catch (err) {
      console.error(err);
      setError('Could not load roles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchRoles(); }, [fetchRoles]);

  // --- CREATE ROLE LOGIC ---
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
        setIsCreateModalOpen(false); // Close modal on success
      } else {
        alert("Failed to create role. It might already exist.");
      }
    } catch (error) {
      console.error("Create Role Error:", error);
      alert("Failed to create role.");
    } finally {
      setIsCreating(false);
    }
  };

  // --- DELETE ROLE LOGIC ---
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
      } else {
        alert("Failed to delete role.");
      }
    } catch (error) {
      console.error("Delete Role Error:", error);
      alert("Failed to delete role.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="role-page">
      
      {/* 1. Header with "Create New" Button */}
      <div className="page-header">
        <div className="header-content">
          <h2><FaShieldAlt /> Role Management</h2>
          <p>Define access levels and manage user permissions across the institute.</p>
        </div>

        {/* This button now triggers the Modal */}
        <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
          <FaPlus /> Create New Role
        </button>
      </div>

      {error && <div style={{color: 'red', padding: '1rem'}}>{error}</div>}

      {/* 2. Roles Grid */}
      <div className="roles-grid">
        {roles.map((role) => {
          const isSystem = SYSTEM_ROLES.includes(role.name);
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
        })}
        
        {!isLoading && roles.length === 0 && !error && (
            <p>No roles found.</p>
        )}
      </div>

      {/* 3. MODALS */}
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