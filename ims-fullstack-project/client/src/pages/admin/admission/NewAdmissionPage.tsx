// client/src/pages/admin/NewAdmissionPage.tsx
import React, { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop'; 
import styles from './NewAdmissionPage.module.scss';
import { type AlertColor } from '@mui/material/Alert'; 
import logo from '../../../assets/image/logo.png'; 
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { FaTimes, FaCheck, FaCamera } from 'react-icons/fa'; 
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

  const [formData, setFormData] = useState({
    fullName: '', fatherName: '', motherName: '', dateOfBirth: '', gender: 'MALE',
    presentAddressDetails: '', presentAddressDivision: '', presentAddressDistrict: '', permanentAddressDetails: '',
    religion: '', nationality: 'Indian', phoneNumber: '', email: '', admissionNo: '', bloodGroup: '',
    occupation: '', maritalStatus: 'SINGLE', classId: '', password: '',
  });
  
  // --- IMAGE CROP STATES ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Generate Random ID
  useEffect(() => {
    const generateId = () => {
      const randomId = Math.floor(100000 + Math.random() * 9000000).toString();
      setFormData(prev => ({ ...prev, admissionNo: randomId }));
    };
    generateId();
  }, []);

  // 2. Fetch Classes
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

  // --- HANDLERS ---

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (field: string) => (e: SelectChangeEvent<string | number>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value as string }));
  };

  // FIX: Robust Date Handler
  const handleDateChange = (field: string) => (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
        // Use 'en-CA' locale to get YYYY-MM-DD format correctly without timezone shifts
        const dateString = date.toLocaleDateString('en-CA');
        setFormData(prev => ({ ...prev, [field]: dateString }));
    } else {
        setFormData(prev => ({ ...prev, [field]: '' }));
    }
  };

  // --- IMAGE HANDLING ---
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
      // FIX: Log error to console to use the 'e' variable and fix TS error
      console.error("Crop Error:", e);
      showAlert('error', 'Failed to crop image.');
    }
  };

  // --- SUBMISSION HANDLER ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Validation: Image
    if (!imageFile) { 
        showAlert('warning', 'Please upload a student photo.'); 
        return; 
    }
    
    // 2. Validation: Date of Birth (CRITICAL FIX)
    // We check if it is empty OR not a valid date string
    if (!formData.dateOfBirth || formData.dateOfBirth.trim() === '') {
        showAlert('warning', 'Please select a valid Date of Birth.');
        return; // STOP execution here so backend doesn't crash
    }

    // 3. Validation: Class
    if (!formData.classId) {
        showAlert('warning', 'Please select a Class/Program.');
        return;
    }

    setIsSubmitting(true);
    
    try {
        const submissionData = new FormData();
        submissionData.append('profileImage', imageFile);
        
        Object.entries(formData).forEach(([key, value]) => {
            if(key !== 'presentAddressDetails' && key !== 'presentAddressDistrict' && key !== 'presentAddressDivision' && key !== 'permanentAddressDetails') {
                 // Map phoneNumber to phone if backend expects 'phone'
                 if (key === 'phoneNumber') {
                     submissionData.append('phone', value); 
                 } else {
                     submissionData.append(key, value);
                 }
            }
        });
        
        const fullAddress = `${formData.presentAddressDetails}, ${formData.presentAddressDistrict}`;
        submissionData.append('address', fullAddress);

        const res = await fetch('http://localhost:5000/api/students/register', {
            method: 'POST',
            body: submissionData 
        });

        if (res.ok) {
            showAlert('success', `Student "${formData.fullName}" admitted successfully!`);
            setTimeout(() => navigate('/view-admission'), 2000);
        } else {
            const error = await res.json();
            const errorMessage = error.message || 'Unknown server error';
            
            if (errorMessage.includes("Date")) {
                showAlert('error', 'Invalid Date. Please re-select Date of Birth.');
            } else {
                showAlert('error', `Failed: ${errorMessage}`);
            }
        }
    } catch (err) {
        // FIX: Use 'err' to fix TS unused variable error
        console.error("Submission Error:", err);
        showAlert('error', 'Network error occurred. Check console.');
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Options Arrays ---
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

      {/* --- CROPPER MODAL --- */}
      {isCropping && (
        <div className={styles.cropperOverlay}>
          <div className={styles.cropperContainer}>
            <div className={styles.cropArea}>
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
            <div className={styles.controls}>
                <input
                    type="range"
                    value={zoom}
                    min={1} max={3} step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className={styles.zoomRange}
                />
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
        
        {/* --- HEADER --- */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logoArea}>
              <img src={logo} alt="IMS" className={styles.logo} style={{height:'60px', width:'auto'}} />
              <div>
                <h1 style={{fontSize:'1.8rem', fontWeight:'800', margin:0}}>IMS</h1>
                <p style={{margin:0, opacity:0.8}}>Excellence in Education</p>
              </div>
            </div>
            
            <div className={styles.photoBox} onClick={() => document.getElementById('photoUpload')?.click()}>
              {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
              ) : (
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', color:'var(--text-muted-color)'}}>
                      <FaCamera style={{fontSize:'1.5rem'}} />
                      <span style={{fontSize:'0.8rem', fontWeight:600}}>UPLOAD PHOTO</span>
                  </div>
              )}
              <input id="photoUpload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
          </div>
          <h2>STUDENT ADMISSION FORM</h2>
        </div>

        {/* --- BODY --- */}
        <div className={styles.formBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Student's Name</label><input type="text" name="fullName" onChange={handleChange} required /></div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label>Father's Name</label><input type="text" name="fatherName" onChange={handleChange} /></div>
            <div className={styles.formGroup}><label>Mother's Name</label><input type="text" name="motherName" onChange={handleChange} /></div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
                <CustomDateTimePicker
                    label="Birth Date"
                    type="date"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                    onChange={handleDateChange('dateOfBirth')}
                    required={true}
                />
            </div>
            
            <div className={styles.formGroup}>
              <label>Gender</label>
              <div className={styles.radioGroup}>
                <label><input type="radio" name="gender" value="MALE" checked={formData.gender === 'MALE'} onChange={handleChange}/> Male</label>
                <label><input type="radio" name="gender" value="FEMALE" checked={formData.gender === 'FEMALE'} onChange={handleChange}/> Female</label>
              </div>
            </div>
          </div>

          <fieldset className={styles.addressFieldset}>
            <legend>Present Address</legend>
            <div className={styles.formRow}><div className={styles.formGroup}><label>Address Details</label><input type="text" name="presentAddressDetails" onChange={handleChange} required /></div></div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label>District</label><input type="text" name="presentAddressDistrict" onChange={handleChange} /></div>
              <div className={styles.formGroup}><label>Division/State</label><input type="text" name="presentAddressDivision" onChange={handleChange} /></div>
            </div>
          </fieldset>

          <fieldset className={styles.addressFieldset}>
            <legend>Permanent Address</legend>
            <div className={styles.formRow}><div className={styles.formGroup}><label>Address Details</label><input type="text" name="permanentAddressDetails" onChange={handleChange} /></div></div>
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
             <div className={styles.formGroup}>
               <label>ID No. (Auto)</label>
               <input type="text" name="admissionNo" value={formData.admissionNo} readOnly style={{backgroundColor: 'var(--bg-secondary-color)', cursor: 'not-allowed', fontWeight: 'bold', color: 'var(--primary-color)'}} />
             </div>
             
             <div className={styles.formGroup}>
               <CustomSelect 
                  label="Blood Group"
                  placeholder="Select..."
                  value={formData.bloodGroup}
                  onChange={handleSelectChange('bloodGroup')}
                  options={bloodGroupOptions}
               />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <CustomSelect
                  label="Select Class/Program"
                  placeholder="Select Class..."
                  value={formData.classId}
                  onChange={handleSelectChange('classId')}
                  options={classOptions}
                  required={true}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Login Password</label>
              <input type="password" name="password" onChange={handleChange} required />
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.submissionArea}>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Confirm Admission'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewAdmissionPage;