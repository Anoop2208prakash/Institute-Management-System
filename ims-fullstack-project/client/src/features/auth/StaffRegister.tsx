// client/src/features/auth/StaffRegister.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCamera } from 'react-icons/fa';
import './StaffRegister.scss';

// Define the shape of a Role object
interface Role {
  id: string;
  name: string;
  displayName: string;
}

const StaffRegister: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. State for Dynamic Roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // 2. State for Form Data
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

  // 3. State for Image Handling
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 4. Fetch Roles on Component Mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/roles'); 
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        } else {
          console.error('Failed to fetch roles');
        }
      } catch (error) {
        console.error('Error connecting to server:', error);
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

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Store the actual file object for upload
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Registration Logic (Multipart Submission)
  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.roleId) {
      alert("Please fill in all required fields (Name, Email, Password, Role)");
      return;
    }

    try {
      // 1. Create FormData object
      const data = new FormData();

      // 2. Append Text Fields
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('phone', formData.phone);
      data.append('dob', formData.dob);
      data.append('roleId', formData.roleId);
      data.append('bloodGroup', formData.bloodGroup);
      data.append('joiningDate', formData.joiningDate);

      // 3. Append Image File (if exists)
      if (imageFile) {
        data.append('profileImage', imageFile);
      }

      // 4. Send Request
      console.log("📤 Sending FormData to Backend...");
      
      const response = await fetch('http://localhost:5000/api/staff/register', {
        method: 'POST',
        // Note: Do NOT set 'Content-Type': 'multipart/form-data' header manually.
        // The browser sets it automatically with the correct boundary.
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Registration Success:", result);
        alert("Staff Registered Successfully!");
        navigate('/login'); // Redirect on success
      } else {
        const errorData = await response.json();
        alert(`Registration Failed: ${errorData.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error("❌ Network Error:", error);
      alert("Network Error: Could not connect to server.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        
        {/* Header */}
        <div className="card-header">
          <FaUserPlus className="icon" />
          <h2>Staff Registration (Temporary)</h2>
        </div>

        {/* Body */}
        <div className="card-body">
          
          {/* Left: Image Upload */}
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

          {/* Right: Form Grid */}
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

        {/* Footer */}
        <div className="card-footer">
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            Back to Login
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffRegister;