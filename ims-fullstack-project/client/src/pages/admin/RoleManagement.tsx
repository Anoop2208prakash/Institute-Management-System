// client/src/pages/admin/RoleManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaTrash, FaShieldAlt, FaPlus, FaLock, FaUserTag } from 'react-icons/fa';
import './RoleManagement.scss';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState({ displayName: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Core System Roles (Cannot be deleted)
  const SYSTEM_ROLES = ['super_admin', 'admin', 'teacher', 'student'];

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

  const handleCreate = async () => {
    if (!newRole.displayName) return;
    try {
      const res = await fetch('http://localhost:5000/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      });
      if (res.ok) {
        setNewRole({ displayName: '', description: '' });
        void fetchRoles();
      }
    } catch (error) {
      // FIX: Log the error so the variable is "used"
      console.error("Create Role Error:", error);
      alert("Failed to create role.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this role? This cannot be undone.')) {
      try {
        await fetch(`http://localhost:5000/api/roles/${id}`, { method: 'DELETE' });
        void fetchRoles();
      } catch (error) {
        console.error("Delete Role Error:", error);
        alert("Failed to delete role.");
      }
    }
  };

  return (
    <div className="role-page">
      
      {/* 1. Modern Header & Action Bar */}
      <div className="page-header">
        <div className="header-content">
          <h2><FaShieldAlt /> Role Management</h2>
          <p>Define access levels and manage user permissions across the institute.</p>
        </div>

        <div className="add-role-form">
          <input 
            type="text" 
            placeholder="Role Name (e.g. Accountant)" 
            value={newRole.displayName}
            onChange={(e) => setNewRole({...newRole, displayName: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Description (Optional)" 
            value={newRole.description}
            onChange={(e) => setNewRole({...newRole, description: e.target.value})}
          />
          <button className="btn-add" onClick={handleCreate} disabled={isLoading}>
            <FaPlus /> Create Role
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && <div style={{color: 'red', padding: '1rem'}}>{error}</div>}

      {/* 2. Premium Card Grid */}
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
                  <button className="delete-btn" onClick={() => handleDelete(role.id)}>
                    <FaTrash /> Delete Role
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Empty State */}
        {!isLoading && roles.length === 0 && !error && (
            <p>No roles found.</p>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;