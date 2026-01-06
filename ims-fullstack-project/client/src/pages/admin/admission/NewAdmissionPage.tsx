// client/src/pages/admin/NewAdmissionPage.tsx
import React, { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop'; 
import styles from './NewAdmissionPage.module.scss';
import { type AlertColor } from '@mui/material/Alert'; 
import logo from '../../../assets/image/logo.png'; 
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { FaTimes, FaCheck, FaCamera, FaHotel } from 'react-icons/fa'; 
import type { SelectChangeEvent } from '@mui/material';
import { getCroppedImg } from '../../../utils/canvasUtils';
import CustomDateTimePicker from '../../../components/common/CustomDateTimePicker';
import CustomSelect from '../../../components/common/CustomSelect';

interface ClassOption {
  id: string;
  name: string;
  description?: string; 
}

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const NewAdmissionPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  // --- 1. ROBUST ADMINISTRATOR GUARD ---
  // Fixes the issue where valid admins are redirected to dashboard
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Convert role to lowercase to handle 'admin', 'ADMIN', 'Admin' etc.
    const userRole = user?.role?.toLowerCase();

    const isAuthorized = userRole === 'admin' || userRole === 'super_admin' || userRole === 'superadmin';

    if (!user || !isAuthorized) {
      console.warn("Unauthorized Role Detected:", userRole);
      navigate('/dashboard'); 
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    fullName: '', fatherName: '', motherName: '', dateOfBirth: '', gender: 'MALE',
    presentAddressDetails: '', presentAddressDivision: '', presentAddressDistrict: '', permanentAddressDetails: '',
    religion: '', nationality: 'Indian', phoneNumber: '', email: '', admissionNo: '', bloodGroup: '',
    occupation: '', maritalStatus: 'SINGLE', classId: '', password: '',
    needsHostel: false, 
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const generateId = () => {
      const randomId = Math.floor(100000 + Math.random() * 9000000).toString();
      setFormData(prev => ({ ...prev, admissionNo: randomId }));
    };
    generateId();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/classes');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setClasses(data);
        }
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (field: string) => (e: SelectChangeEvent<string | number>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value as string }));
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
        const dateString = date.toLocaleDateString('en-CA');
        setFormData(prev => ({ ...prev, [field]: dateString }));
    } else {
        setFormData(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      const croppedFile = await getCroppedImg(tempImageSrc, croppedAreaPixels, 'student-avatar.jpeg');
      if (croppedFile) {
        setImageFile(croppedFile);
        setImagePreview(URL.createObjectURL(croppedFile));
        setIsCropping(false); 
        setTempImageSrc(null); 
      }
    } catch (e) {
      console.error("Crop Error:", e);
      showAlert('error', 'Failed to crop image.');
    }
  };

  // --- 2. SECURE SUBMISSION HANDLER ---
  // Fixes 401 Unauthorized and 403 Forbidden console errors
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!imageFile) { showAlert('warning', 'Please upload a student photo.'); return; }
    if (!formData.dateOfBirth) { showAlert('warning', 'Please select Date of Birth.'); return; }
    if (!formData.classId) { showAlert('warning', 'Please select a Class.'); return; }

    setIsSubmitting(true);
    
    try {
        const token = localStorage.getItem('token'); 
        const submissionData = new FormData();
        submissionData.append('profileImage', imageFile);
        
        Object.entries(formData).forEach(([key, value]) => {
            if(!['presentAddressDetails', 'presentAddressDistrict', 'presentAddressDivision', 'permanentAddressDetails'].includes(key)) {
                 // Remap 'phoneNumber' to 'phone' as expected by studentController.ts
                 submissionData.append(key === 'phoneNumber' ? 'phone' : key, String(value)); 
            }
        });
        
        const fullAddress = `${formData.presentAddressDetails}, ${formData.presentAddressDistrict}`;
        submissionData.append('address', fullAddress);

        const res = await fetch('http://localhost:5000/api/students/register', {
            method: 'POST',
            headers: {
                // REQUIRED: Prove Admin permissions to the backend
                'Authorization': `Bearer ${token}` 
            },
            body: submissionData 
        });

        if (res.ok) {
            showAlert('success', `Student admitted successfully!`);
            setTimeout(() => navigate('/view-admission'), 2000);
        } else {
            const error = await res.json();
            // Handle specific 403 scenarios
            const msg = res.status === 403 
                ? "Permission Denied: You must be an Administrator to perform admissions." 
                : (error.message || 'Unknown error');
            showAlert('error', `Failed: ${msg}`);
        }
    } catch (err) {
        console.error("Submission Error:", err);
        showAlert('error', 'Network error occurred. Check server status.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  ];

  const classOptions = classes.map(cls => ({
      value: cls.id,
      label: `${cls.name} ${cls.description ? `(${cls.description})` : ''}`
  }));

  return (
    <div className={styles.pageWrapper}>
      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />

      {isCropping && (
        <div className={styles.cropperOverlay}>
          <div className={styles.cropperContainer}>
            <div className={styles.cropArea}>
                <Cropper image={tempImageSrc || ''} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className={styles.controls}>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className={styles.zoomRange} />
                <div className={styles.buttons}>
                    <button type="button" className={styles.btnCancel} onClick={() => { setIsCropping(false); setTempImageSrc(null); }}>
                        <FaTimes /> Cancel
                    </button>
                    <button type="button" className={styles.btnApply} onClick={showCroppedImage}>
                        <FaCheck /> Crop & Save
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.admissionForm}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logoArea}>
              <img src={logo} alt="IMS" className={styles.logo} style={{height:'60px', width:'auto'}} />
              <div>
                <h1 style={{fontSize:'1.8rem', fontWeight:'800', margin:0}}>IMS Pro</h1>
                <p style={{margin:0, opacity:0.8}}>Unified Digital Ecosystem</p>
              </div>
            </div>
            
            <div className={styles.photoBox} onClick={() => document.getElementById('photoUpload')?.click()}>
              {imagePreview ? <img src={imagePreview} alt="Preview" /> : <div className={styles.uploadPlaceholder}><FaCamera /><span>UPLOAD PHOTO</span></div>}
              <input id="photoUpload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
          </div>
          <h2>STUDENT ADMISSION FORM</h2>
        </div>

        <div className={styles.formBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Student's Full Name</label><input type="text" name="fullName" onChange={handleChange} required /></div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Father's Name</label><input type="text" name="fatherName" onChange={handleChange} /></div>
            <div className={styles.formGroup}><label>Mother's Name</label><input type="text" name="motherName" onChange={handleChange} /></div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}><CustomDateTimePicker label="Birth Date" type="date" value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null} onChange={handleDateChange('dateOfBirth')} required={true} /></div>
            <div className={styles.formGroup}><label>Gender</label>
              <div className={styles.radioGroup}>
                <label><input type="radio" name="gender" value="MALE" checked={formData.gender === 'MALE'} onChange={handleChange}/> Male</label>
                <label><input type="radio" name="gender" value="FEMALE" checked={formData.gender === 'FEMALE'} onChange={handleChange}/> Female</label>
              </div>
            </div>
          </div>

          <fieldset className={styles.addressFieldset}>
            <legend>Residential Details</legend>
            <div className={styles.formRow}><div className={styles.formGroup}><label>Address Details</label><input type="text" name="presentAddressDetails" onChange={handleChange} required /></div></div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label>District</label><input type="text" name="presentAddressDistrict" onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>Division/State</label><input type="text" name="presentAddressDivision" onChange={handleChange} /></div>
            </div>
          </fieldset>

          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Religion</label><input type="text" name="religion" onChange={handleChange} /></div>
            <div className={styles.formGroup}><label>Nationality</label><input type="text" name="nationality" value={formData.nationality} onChange={handleChange} /></div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Phone Number</label><input type="tel" name="phoneNumber" onChange={handleChange} required /></div>
            <div className={styles.formGroup}><label>Email Address</label><input type="email" name="email" onChange={handleChange} required /></div>
          </div>

          <div className={styles.formRow}>
             <div className={styles.formGroup}><label>Admission ID (Auto)</label><input type="text" name="admissionNo" value={formData.admissionNo} readOnly /></div>
             <div className={styles.formGroup}><CustomSelect label="Blood Group" value={formData.bloodGroup} onChange={handleSelectChange('bloodGroup')} options={bloodGroupOptions} /></div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}><CustomSelect label="Select Class" value={formData.classId} onChange={handleSelectChange('classId')} options={classOptions} required={true} /></div>
            <div className={styles.formGroup}><label>Login Password</label><input type="password" name="password" onChange={handleChange} required /></div>
          </div>

          <div className={styles.hostelSection}>
            <div className={styles.hostelCheckboxGroup}>
                <label className={styles.checkboxLabel}>
                    <input type="checkbox" name="needsHostel" checked={formData.needsHostel} onChange={handleChange} />
                    <span className={styles.checkboxCustom}></span>
                    <div className={styles.labelText}>
                        <FaHotel className={styles.hostelIcon} />
                        <span>Enroll for Hostel Accommodation</span>
                    </div>
                </label>
                <p className={styles.helperText}>Check this to automatically add the student to the hostel pending list.</p>
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.submissionArea}>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Confirming...' : 'Complete Admission'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewAdmissionPage;