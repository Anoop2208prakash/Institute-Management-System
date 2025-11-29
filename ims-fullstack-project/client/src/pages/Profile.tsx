// client/src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaIdBadge, FaEdit } from 'react-icons/fa';
import './Profile.scss';

// Interface matching the API response structure
interface ProfileData {
  id: string;
  name: string;
  email: string;
  sID: string;
  role: string;
  roleDisplay: string;
  avatar?: string;
  details: {
    phone?: string;
    bloodGroup?: string;
    department?: string;
    program?: string;
    joinDate?: string;
  };
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          setProfile(await res.json());
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div style={{padding: '2rem'}}>Loading Profile...</div>;
  if (!profile) return <div style={{padding: '2rem'}}>Profile not found.</div>;

  return (
    <div className="profile-page">
      
      {/* 1. Header Card with Banner */}
      <div className="profile-header">
        <div className="banner"></div>
        <div className="header-content">
          <div className="avatar-wrapper">
            <img 
              src={profile.avatar ? `http://localhost:5000${profile.avatar}` : 'https://via.placeholder.com/150'} 
              alt={profile.name} 
            />
            <span className="role-badge">{profile.roleDisplay}</span>
          </div>
          
          <div className="user-info">
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            <span className="id-pill">ID: {profile.sID}</span>
          </div>

          <div className="header-actions">
            <button><FaEdit /> Edit Profile</button>
          </div>
        </div>
      </div>

      {/* 2. Details Grid */}
      <div className="details-grid">
        
        {/* Left Column: Personal Info */}
        <div className="section-card">
          <h3><FaUser /> Personal Information</h3>
          
          <div className="info-row">
            <span className="label">Full Name</span>
            <span className="value">{profile.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Email Address</span>
            <span className="value">{profile.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Phone Number</span>
            <span className="value">{profile.details.phone || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Blood Group</span>
            <span className="value">{profile.details.bloodGroup || 'N/A'}</span>
          </div>
        </div>

        {/* Right Column: Account Info */}
        <div className="section-card">
          <h3><FaIdBadge /> Account Details</h3>
          
          <div className="info-row">
            <span className="label">Role</span>
            <span className="value">{profile.roleDisplay}</span>
          </div>
          <div className="info-row">
            <span className="label">Date Joined</span>
            <span className="value">
                {profile.details.joinDate 
                    ? new Date(profile.details.joinDate).toLocaleDateString() 
                    : 'N/A'}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Status</span>
            <span className="value" style={{color: 'var(--font-color-success)'}}>Active</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;