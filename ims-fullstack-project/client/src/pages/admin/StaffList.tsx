// client/src/pages/admin/StaffList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaSearch, FaUserPlus, FaTrash, FaEnvelope, FaPhone } from 'react-icons/fa';
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
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch Staff
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

  // 2. Delete Logic
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}? This action is permanent.`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/staff/${id}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          fetchStaff(); // Refresh list
        } else {
          alert('Failed to delete staff member');
        }
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  // 3. Filter Logic
  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="staff-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-title">
            <h2><FaUsers /> Manage Staff</h2>
            <p>View, manage, and recruit institute staff members.</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/staff-register')}>
            <FaUserPlus /> Add New Staff
        </button>
      </div>

      {/* Search Bar */}
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

      {/* Staff Grid */}
      <div className="staff-grid">
        {isLoading ? (
            <p style={{color: 'var(--text-muted-color)'}}>Loading directory...</p>
        ) : filteredStaff.length > 0 ? (
            filteredStaff.map((member) => (
            <div key={member.id} className="staff-card">
                <div className="card-header">
                    <img 
                        src={member.avatar ? `http://localhost:5000${member.avatar}` : `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                        alt={member.name} 
                        className="avatar"
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
                        onClick={() => handleDelete(member.id, member.name)}
                        title="Remove Staff"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
            ))
        ) : (
            <div className="empty-state">No staff members found.</div>
        )}
      </div>
    </div>
  );
};

export default StaffList;