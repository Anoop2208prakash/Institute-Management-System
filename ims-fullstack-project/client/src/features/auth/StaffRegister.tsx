// client/src/features/auth/StaffRegister.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCamera, FaTimes, FaCheck } from 'react-icons/fa';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/canvasUtils';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { type AlertColor } from '@mui/material/Alert';
import './StaffRegister.scss';

// Define the shape of a Role object
interface Role {
  id: string;
  name: string;
  displayName: string;
}

// Crop Type definition
interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const StaffRegister: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. State for Dynamic Roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // 2. Alert State
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean; 
    type: AlertColor; 
    msg: string;
  }>({ 
    show: false, 
    type: 'success', 
    msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  // 3. State for Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    roleId: '', 
    bloodGroup: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  // 4. State for Image & Cropper
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  // 5. Fetch Roles (and Filter out Student)
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/roles'); 
        if (response.ok) {
          const data = await response.json();
          
          // FILTER: Remove 'student' from the list
          const staffRoles = data.filter((role: Role) => role.name !== 'student');
          
          setRoles(staffRoles);
        } else {
          console.error('Failed to fetch roles');
          showAlert('error', 'Failed to load roles.');
        }
      } catch (error) {
        console.error('Error connecting to server:', error);
        showAlert('error', 'Network error. Check connection.');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- CROPPER LOGIC ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const onCropComplete = useCallback((croppedArea: PixelCrop, croppedAreaPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    if (!tempImageSrc || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(
        tempImageSrc,
        croppedAreaPixels,
        'staff-avatar.jpeg'
      );
      if (croppedFile) {
        setImageFile(croppedFile);
        setImagePreview(URL.createObjectURL(croppedFile));
        setIsCropping(false);
        setTempImageSrc(null);
      }
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to crop image.');
    }
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.roleId) {
      showAlert('warning', "Please fill in all required fields (Name, Email, Password, Role)");
      return;
    }

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('phone', formData.phone);
      data.append('dob', formData.dob);
      data.append('roleId', formData.roleId);
      data.append('bloodGroup', formData.bloodGroup);
      data.append('joiningDate', formData.joiningDate);

      if (imageFile) {
        data.append('profileImage', imageFile);
      }
      
      const response = await fetch('http://localhost:5000/api/staff/register', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        showAlert('success', "Staff Registered Successfully!");
        setTimeout(() => navigate('/staff'), 1000);
      } else {
        const errorData = await response.json();
        showAlert('error', `Registration Failed: ${errorData.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error("❌ Network Error:", error);
      showAlert('error', "Network Error: Could not connect to server.");
    }
  };

  return (
    <div className="register-container">
      
      <FeedbackAlert 
        isOpen={alertInfo.show} 
        type={alertInfo.type} 
        message={alertInfo.msg} 
        onClose={() => setAlertInfo({ ...alertInfo, show: false })}
      />

      {isCropping && (
        <div className="cropper-modal">
          <div className="cropper-container">
            <div className="crop-area">
                <Cropper
                image={tempImageSrc || ''}
                crop={crop}
                zoom={zoom}
                aspect={1}
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

      <div className="register-card">
        <div className="card-header">
          <FaUserPlus className="icon" />
          <h2>Staff Registration</h2>
        </div>

        <div className="card-body">
          <div className="image-upload-section">
            <label className="field-label">Profile Image</label>
            <div className="image-preview-box" onClick={() => document.getElementById('fileInput')?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile Preview" />
              ) : (
                <div className="upload-placeholder">
                  <FaCamera className="upload-icon" />
                  <span>Upload Photo</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              id="fileInput" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageChange}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="field-label">Full Name</label>
              <input 
                name="fullName"
                type="text" 
                className="form-input" 
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="field-label">Email</label>
              <input 
                name="email"
                type="email" 
                className="form-input" 
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="field-label">Password</label>
              <input 
                name="password"
                type="password" 
                className="form-input" 
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="field-label">Phone Number</label>
              <input 
                name="phone"
                type="tel" 
                className="form-input" 
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="field-label">Date of Birth</label>
              <input 
                name="dob"
                type="date" 
                className="form-input"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="field-label">Role</label>
              <select 
                name="roleId"
                className="form-select" 
                value={formData.roleId}
                onChange={handleChange}
              >
                <option value="" disabled>Select Role...</option>
                {loadingRoles ? (
                  <option>Loading roles...</option>
                ) : (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.displayName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="field-label">Blood Group</label>
              <select 
                name="bloodGroup"
                className="form-select" 
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="" disabled>Select...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="field-label">Date Joined</label>
              <input 
                name="joiningDate"
                type="date" 
                className="form-input"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card-footer">
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            Back to Login
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Register Staff
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffRegister;