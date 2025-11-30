// client/src/pages/admin/NewAdmissionPage.tsx
import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'; // <--- FIXED HERE
import { useNavigate } from 'react-router-dom';
import styles from './NewAdmissionPage.module.scss';
// Ensure you have a logo image or remove this import if unused
// import logo from '../../../assets/image/logo.png'; 

interface ClassOption {
  id: string;
  name: string;
  section: string;
}

const NewAdmissionPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Personal
    fullName: '',
    fatherName: '', 
    motherName: '', 
    dateOfBirth: '',
    gender: 'MALE',
    
    // Address (Combined string for backend)
    presentAddressDetails: '',
    presentAddressDivision: '',
    presentAddressDistrict: '',
    permanentAddressDetails: '',
    
    // Other
    religion: '',
    nationality: 'Indian',
    phoneNumber: '',
    email: '',
    nidNumber: '',
    bloodGroup: '',
    occupation: '',
    maritalStatus: 'SINGLE',
    
    // System
    classId: '', 
    password: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);

  // Fetch Classes for Dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Mock Data for UI demonstration. 
        // In real app: const res = await fetch('http://localhost:5000/api/classes'); setClasses(await res.json());
        setClasses([
            { id: '1', name: 'Grade 10', section: 'A' },
            { id: '2', name: 'Grade 11', section: 'Science' },
            { id: '3', name: 'Grade 12', section: 'Commerce' }
        ]);
      } catch (err) {
        console.error(err);
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

    if (!imageFile) {
      alert('Please upload a student photo.');
      return;
    }

    try {
        const submissionData = new FormData();
        
        // Append Image
        submissionData.append('profileImage', imageFile);

        // Map Form Fields to Backend Schema
        submissionData.append('fullName', formData.fullName);
        submissionData.append('email', formData.email);
        submissionData.append('password', formData.password);
        submissionData.append('phone', formData.phoneNumber);
        submissionData.append('dob', formData.dateOfBirth);
        submissionData.append('gender', formData.gender);
        submissionData.append('bloodGroup', formData.bloodGroup);
        submissionData.append('admissionNo', formData.nidNumber || Date.now().toString()); 
        
        // Combine Address fields
        const fullAddress = `${formData.presentAddressDetails}, ${formData.presentAddressDistrict}`;
        submissionData.append('address', fullAddress);
        // Note: classId needs to be handled in backend (currently using default class in controller)

        // Send to Backend
        const res = await fetch('http://localhost:5000/api/students/register', {
            method: 'POST',
            body: submissionData 
        });

        if (res.ok) {
            alert(`Student "${formData.fullName}" admitted successfully!`);
            navigate('/view-admission');
        } else {
            const error = await res.json();
            alert(`Failed: ${error.message}`);
        }
    } catch (err) {
        console.error(err);
        alert('Network error occurred.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <form onSubmit={handleSubmit} className={styles.admissionForm}>
        
        {/* --- HEADER --- */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logoArea}>
              <div style={{fontSize: '3rem', fontWeight:'bold', color:'var(--primary-color)'}}>IMS</div>
              <div>
                <h1>INSTITUTE MANAGEMENT</h1>
                <p>Excellence in Education</p>
              </div>
            </div>
            <div className={styles.photoBox} onClick={() => document.getElementById('photoUpload')?.click()}>
              {imagePreview ? <img src={imagePreview} alt="Student Preview" /> : 'UPLOAD PHOTO'}
              <input 
                id="photoUpload" type="file" accept="image/png, image/jpeg" 
                onChange={handleImageChange} style={{ display: 'none' }}
              />
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
            <div className={styles.formGroup}><label>Admission/NID No</label><input type="text" name="nidNumber" onChange={handleChange} required placeholder="Unique ID"/></div>
            <div className={styles.formGroup}><label>Blood Group</label><input type="text" name="bloodGroup" onChange={handleChange} /></div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Select Class/Program</label>
              <select name="classId" value={formData.classId} onChange={handleChange} required>
                <option value="" disabled>-- Select Class --</option>
                {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name} ({cls.section})</option>)}
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
          <div className={styles.declaration}>
            <h3>DECLARATION</h3>
            <p>I hereby declare that the information provided above is true and correct to the best of my knowledge. I agree to abide by the rules and regulations of the institution.</p>
          </div>
          <div className={styles.signatures}>
            <div className={styles.signatureBox}><label>Student's Signature</label></div>
            <div className={styles.signatureBox}><label>Principal's Signature</label></div>
          </div>
          <div className={styles.submissionArea}>
            <button type="submit" className={styles.submitButton}>Confirm Admission</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewAdmissionPage;