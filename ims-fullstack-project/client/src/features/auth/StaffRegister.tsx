// client/src/features/auth/StaffRegister.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCamera, FaTimes, FaCheck } from 'react-icons/fa';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/canvasUtils';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { type AlertColor } from '@mui/material/Alert';
import CustomDateTimePicker from '../../components/common/CustomDateTimePicker';
import CustomSelect from '../../components/common/CustomSelect';

import './StaffRegister.scss';
import type { SelectChangeEvent } from '@mui/material';

interface Role {
  id: string;
  name: string;
  displayName: string;
}

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const StaffRegister: React.FC = () => {
  const navigate = useNavigate();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

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

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/roles'); 
        if (response.ok) {
          const data = await response.json();
          const staffRoles = data.filter((role: Role) => role.name !== 'student');
          setRoles(staffRoles);
        } else {
          showAlert('error', 'Failed to load roles.');
        }
      } catch (error) {
        showAlert('error', 'Network error. Check connection.');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: string) => (e: SelectChangeEvent<string | number>) => {
    setFormData({ ...formData, [field]: e.target.value as string });
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      setFormData({ ...formData, [field]: dateString });
    } else {
      setFormData({ ...formData, [field]: '' });
    }
  };

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

  const onCropComplete = useCallback((_croppedArea: PixelCrop, croppedAreaPixels: PixelCrop) => {
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
      showAlert('error', 'Failed to crop image.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.roleId) {
      showAlert('warning', "Please fill in all required fields.");
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
          data.append(key, value);
      });

      // FIXED: Changed key to 'avatar' to match the database column 
      // and controller expectations for Cloudinary
      if (imageFile) {
        data.append('avatar', imageFile);
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
      showAlert('error', "Network Error: Could not connect to server.");
    }
  };

  const roleOptions = roles.map(r => ({ value: r.id, label: r.displayName }));
  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  ];

  return (
    <div className="register-container">
      {/* ... (FeedbackAlert and Cropper Modal logic remains unchanged) */}
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
                    min={1} max={3} step={0.1}
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
                <CustomDateTimePicker
                    label="Date of Birth"
                    type="date"
                    value={formData.dob ? new Date(formData.dob) : null}
                    onChange={handleDateChange('dob')}
                />
            </div>

            <div className="form-group">
                <CustomSelect
                    label="Role" 
                    placeholder="Select Role..."
                    value={formData.roleId}
                    onChange={handleSelectChange('roleId')}
                    options={roleOptions}
                    required={true}
                />
            </div>

            <div className="form-group">
                <CustomSelect 
                    label="Blood Group"
                    placeholder="Select Blood Group..."
                    value={formData.bloodGroup}
                    onChange={handleSelectChange('bloodGroup')}
                    options={bloodGroupOptions}
                />
            </div>

            <div className="form-group">
                 <CustomDateTimePicker 
                    label="Joining Date"
                    type="date"
                    value={formData.joiningDate ? new Date(formData.joiningDate) : new Date()}
                    onChange={handleDateChange('joiningDate')}
                    disabled={true} 
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