// client/src/pages/admin/NewAdmissionPage.tsx
import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NewAdmissionPage.module.scss';
import { type AlertColor } from '@mui/material/Alert'; 
import logo from '../../../assets/image/logo.png'; // <--- Import Logo
import FeedbackAlert from '../../../components/common/FeedbackAlert';

interface ClassOption {
  id: string;
  name: string;
  description?: string; 
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
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Generate Random ID (< 8 digits)
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile) { showAlert('warning', 'Please upload a student photo.'); return; }

    setIsSubmitting(true);
    try {
        const submissionData = new FormData();
        submissionData.append('profileImage', imageFile);
        
        Object.entries(formData).forEach(([key, value]) => {
            if(key !== 'presentAddressDetails' && key !== 'presentAddressDistrict' && key !== 'presentAddressDivision' && key !== 'permanentAddressDetails') {
                 submissionData.append(key, value);
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
            showAlert('error', `Failed: ${error.message}`);
            setIsSubmitting(false);
        }
    } catch (err) {
        showAlert('error', 'Network error occurred.');
        setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />

      <form onSubmit={handleSubmit} className={styles.admissionForm}>
        
        {/* --- HEADER --- */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logoArea}>
              {/* UPDATED: Image Logo + "IMS" Text */}
              <img src={logo} alt="IMS" className={styles.logo} style={{height:'60px', width:'auto'}} />
              <div>
                <h1 style={{fontSize:'1.8rem', fontWeight:'800', margin:0}}>IMS</h1>
                <p style={{margin:0, opacity:0.8}}>Excellence in Education</p>
              </div>
            </div>
            
            <div className={styles.photoBox} onClick={() => document.getElementById('photoUpload')?.click()}>
              {imagePreview ? <img src={imagePreview} alt="Preview" /> : 'UPLOAD PHOTO'}
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
            <div className={styles.formGroup}><label>Birth Date</label><input type="date" name="dateOfBirth" onChange={handleChange} required /></div>
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
             {/* Auto-Generated ID */}
             <div className={styles.formGroup}>
                <label>ID No. (Auto)</label>
                <input type="text" name="admissionNo" value={formData.admissionNo} readOnly style={{backgroundColor: 'var(--bg-secondary-color)', cursor: 'not-allowed', fontWeight: 'bold', color: 'var(--primary-color)'}} />
             </div>
             {/* Blood Group */}
             <div className={styles.formGroup}>
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
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
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Select Class/Program</label>
              <select name="classId" value={formData.classId} onChange={handleChange} required>
                <option value="" disabled>-- Select Class --</option>
                {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.description ? `(${cls.description})` : ''}
                    </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Login Password</label>
              <input type="password" name="password" onChange={handleChange} required />
            </div>
          </div>
        </div>
        
        {/* --- FOOTER --- */}
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