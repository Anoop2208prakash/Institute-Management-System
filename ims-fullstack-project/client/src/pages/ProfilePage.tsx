// client/src/pages/ProfilePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt, FaTint, FaSave, FaTimes, FaCamera, FaLock, FaCheck } from 'react-icons/fa';
import Cropper from 'react-easy-crop'; // Ensure 'react-easy-crop' is installed
import { getCroppedImg } from '../utils/canvasUtils';
import './ProfilePage.scss';

// --- TYPES ---

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
    joinDate?: string;
  }
}

// Fix for "Unexpected any": Define the shape of the crop object from 'react-easy-crop'
interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bloodGroup: '',
    password: '', 
  });
  
  // --- CROPPER STATE ---
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Cropper Controls
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData({
            fullName: data.name,
            phone: data.details.phone || '',
            bloodGroup: data.details.bloodGroup || '',
            password: ''
          });
          setPreviewUrl(null);
          setNewAvatar(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. TRIGGER CROPPER ON FILE SELECT
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result as string);
        setIsCropping(true); 
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. CAPTURE CROP AREA
  const onCropComplete = useCallback((_croppedArea: PixelCrop, croppedAreaPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 3. FINALIZE CROP
  const showCroppedImage = async () => {
    if (!tempImageSrc || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(
        tempImageSrc,
        croppedAreaPixels,
        'new-avatar.jpeg'
      );
      if (croppedFile) {
        setNewAvatar(croppedFile);
        setPreviewUrl(URL.createObjectURL(croppedFile));
        setIsCropping(false); // Close Modal
        setTempImageSrc(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Updates
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('phone', formData.phone);
      data.append('bloodGroup', formData.bloodGroup);
      if (formData.password) data.append('password', formData.password);
      if (newAvatar) data.append('profileImage', newAvatar); // Note: Backend likely expects 'profileImage'

      const res = await fetch('http://localhost:5000/api/profile/me', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      if (res.ok) {
        setIsEditing(false);
        fetchProfile(); 
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Update error", error);
    }
  };

  if (loading) return <div style={{padding: '3rem', textAlign: 'center'}}>Loading Profile...</div>;
  if (!profile) return <div style={{padding: '3rem', textAlign: 'center'}}>Profile not found.</div>;

  const formatDate = (dateStr?: string) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const currentAvatar = previewUrl 
    ? previewUrl 
    : profile.avatar 
        ? `http://localhost:5000${profile.avatar}` 
        : `https://ui-avatars.com/api/?name=${profile.name}&background=0D8ABC&color=fff`;

  return (
    <div className="profile-page">
      
      {/* --- CROPPER MODAL --- */}
      {isCropping && (
        <div className="cropper-modal">
          <div className="cropper-container">
            <div className="crop-area">
                <Cropper
                image={tempImageSrc || ''}
                crop={crop}
                zoom={zoom}
                aspect={1} // Square/Circular aspect ratio
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                />
            </div>
            <div className="controls">
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="zoom-range"
                />
                <div className="buttons">
                    <button className="btn-cancel" onClick={() => setIsCropping(false)}>
                        <FaTimes /> Cancel
                    </button>
                    <button className="btn-apply" onClick={showCroppedImage}>
                        <FaCheck /> Crop & Apply
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      <div className="profile-cover"></div>

      <div className="profile-content">
        {/* Left Column */}
        <div className="identity-column">
          <div className="avatar-card">
            <div className="avatar-wrapper">
                <img src={currentAvatar} alt={profile.name} />
                
                {isEditing && (
                  <label htmlFor="avatar-upload" className="edit-overlay">
                    <FaCamera />
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      hidden 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
                  </label>
                )}
            </div>

            {isEditing ? (
              <input 
                type="text" 
                name="fullName"
                className="edit-input name-input"
                value={formData.fullName} 
                onChange={handleChange} 
              />
            ) : (
              <h2>{profile.name}</h2>
            )}
            
            <span className="role-badge">{profile.roleDisplay}</span>

            <div className="actions">
                {isEditing ? (
                  <div style={{display:'flex', gap:'10px', width:'100%'}}>
                    <button onClick={handleSave} style={{borderColor: 'var(--font-color-success)', color: 'var(--font-color-success)'}}>
                        <FaSave style={{marginRight: '8px'}}/> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} style={{borderColor: 'var(--font-color-danger)', color: 'var(--font-color-danger)'}}>
                        <FaTimes style={{marginRight: '8px'}}/> Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)}>
                      <FaEdit style={{marginRight: '8px'}}/> Edit Profile
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="details-column">
          <div className="info-card">
            <div className="card-header">
                <h3>Personal Information</h3>
            </div>
            
            <div className="info-grid">
                <div className="info-item">
                    <label><FaIdCard /> System ID</label>
                    <span>{profile.sID}</span>
                </div>

                <div className="info-item">
                    <label><FaEnvelope /> Email Address</label>
                    <span className="read-only">{profile.email}</span>
                </div>

                <div className="info-item">
                    <label><FaPhone /> Phone Number</label>
                    {isEditing ? (
                      <input 
                        name="phone" 
                        className="edit-input" 
                        value={formData.phone} 
                        onChange={handleChange}
                      />
                    ) : (
                      <span>{profile.details.phone || 'N/A'}</span>
                    )}
                </div>

                <div className="info-item">
                    <label><FaTint /> Blood Group</label>
                    {isEditing ? (
                      <select name="bloodGroup" className="edit-input" value={formData.bloodGroup} onChange={handleChange}>
                        <option value="">Select...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    ) : (
                      <span>{profile.details.bloodGroup || 'N/A'}</span>
                    )}
                </div>

                {isEditing && (
                  <div className="info-item">
                    <label><FaLock /> Change Password</label>
                    <input 
                      type="password" 
                      name="password" 
                      className="edit-input" 
                      placeholder="Leave blank to keep current" 
                      value={formData.password} 
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="info-item">
                    <label><FaCalendarAlt /> Joined Date</label>
                    <span className="read-only">{formatDate(profile.details.joinDate)}</span>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;