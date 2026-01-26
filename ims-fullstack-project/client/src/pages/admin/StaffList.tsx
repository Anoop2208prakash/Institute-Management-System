// client/src/pages/admin/StaffList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaSearch, FaUserPlus, FaTrash, FaEnvelope, FaPhone } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import { DeleteModal } from '../../components/common/DeleteModal';
import './StaffList.scss';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  avatar: string | null;
  joinDate: string;
}

const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/staff');
      if (res.ok) {
        setStaff(await res.json());
      }
    } catch (error) {
      console.error("Failed to load staff", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const openDeleteModal = (id: string, name: string) => {
    setStaffToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setStaffToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/staff/${staffToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchStaff();
        closeDeleteModal();
      } else {
        alert('Failed to delete staff member');
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("Network error while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="staff-page">
      <div className="page-header">
        <div className="header-title">
            <h2><FaUsers /> Manage Staff</h2>
            <p>View, manage, and recruit institute staff members.</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/staff-register')}>
            <FaUserPlus /> Add New Staff
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
            <FaSearch />
            <input 
                type="text" 
                placeholder="Search by name, email, or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="count-badge">
            {filteredStaff.length} Members
        </div>
      </div>

      <div className="staff-grid">
        {isLoading ? (
            Array.from(new Array(6)).map((_, index) => (
                <div key={index} className="staff-card">
                    <div className="card-header">
                        <Skeleton variant="circular" width={80} height={80} style={{border: '4px solid var(--card-bg-default)'}} />
                        <Skeleton variant="rectangular" width={60} height={20} style={{borderRadius: '20px', marginTop: '10px'}} />
                    </div>
                    <div className="card-body">
                        <Skeleton variant="text" width="60%" height={30} style={{margin: '0 auto 10px'}} />
                        <div className="info-row" style={{justifyContent: 'center'}}><Skeleton variant="text" width="80%" /></div>
                        <div className="info-row" style={{justifyContent: 'center'}}><Skeleton variant="text" width="50%" /></div>
                    </div>
                    <div className="card-footer" style={{justifyContent: 'space-between'}}>
                         <Skeleton variant="text" width={60} />
                         <Skeleton variant="circular" width={30} height={30} />
                    </div>
                </div>
            ))
        ) : (
            filteredStaff.length > 0 ? (
                filteredStaff.map((member) => (
                <div key={member.id} className="staff-card">
                    <div className="card-header">
                        {/* FIXED: Using direct avatar URL for Cloudinary support */}
                        <img 
                            src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                            alt={member.name} 
                            className="avatar"
                            onError={(e) => {
                                // Fallback if Cloudinary link is broken
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${member.name}&background=random`;
                            }}
                        />
                        <div className="role-tag">{member.role}</div>
                    </div>
                    
                    <div className="card-body">
                        <h3>{member.name}</h3>
                        <div className="info-row">
                            <FaEnvelope /> <span>{member.email}</span>
                        </div>
                        <div className="info-row">
                            <FaPhone /> <span>{member.phone || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="card-footer">
                        <span className="date">Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                        
                        <button 
                            className="btn-delete" 
                            onClick={() => openDeleteModal(member.id, member.name)}
                            title="Remove Staff"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
                ))
            ) : (
                <div className="empty-state">No staff members found.</div>
            )
        )}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Remove Staff Member"
        message="Are you sure you want to remove"
        itemName={staffToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default StaffList;