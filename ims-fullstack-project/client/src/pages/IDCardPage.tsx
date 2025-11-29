// client/src/pages/IDCardPage.tsx
import React, { useState, useEffect } from 'react';
import { BsPersonSquare, BsPrinter } from 'react-icons/bs';
import styles from './IDCardPage.module.scss';

// 1. Interface matching Backend Response
interface ProfileData {
  id: string;
  name: string;
  email: string;
  sID: string; // Staff ID or Student Admission No
  role: string;
  roleDisplay: string;
  avatar?: string;
  details: {
    phone?: string;
    bloodGroup?: string;
    department?: string;
    program?: string;
    joinDate?: string;
  }
}

const IDCardPage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming you store token here on login
        const response = await fetch('http://localhost:5000/api/profile/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error('Failed to fetch profile');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading ID Card...</div>;
  if (!profile) return <div style={{padding: '2rem', textAlign: 'center'}}>Profile not found. Please log in.</div>;

  // 3. Helper to format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // 4. Calculate Expiry (Example: 1 year from join for Staff, 4 for Students)
  const getExpiry = () => {
    if (!profile.details.joinDate) return 'N/A';
    const date = new Date(profile.details.joinDate);
    const years = profile.role === 'student' ? 4 : 5; 
    date.setFullYear(date.getFullYear() + years);
    return date.toLocaleDateString('en-GB');
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.idCard}>
        
        <div className={styles.topClip}></div>
        
        <div className={styles.cardBody}>
          <div className={styles.photo}>
            {profile.avatar ? (
              <img src={`http://localhost:5000${profile.avatar}`} alt="Profile" />
            ) : (
              <BsPersonSquare className={styles.photoIcon} />
            )}
          </div>

          <div className={styles.details}>
            <p className={styles.name}>{profile.name}</p>
            <p className={styles.title}>
                {profile.details.department || profile.details.program || profile.roleDisplay}
            </p>

            <div className={styles.infoGrid}>
              <span className={styles.label}>ID NO</span>
              <span className={styles.value}>: {profile.sID}</span>
              
              {profile.details.bloodGroup && (
                <>
                  <span className={styles.label}>BLOOD</span>
                  <span className={styles.value}>: {profile.details.bloodGroup}</span>
                </>
              )}
              
              {profile.details.phone && (
                <>
                  <span className={styles.label}>PHONE</span>
                  <span className={styles.value}>: {profile.details.phone}</span>
                </>
              )}
              
              <span className={styles.label}>EMAIL</span>
              <span className={styles.value}>: {profile.email}</span>
            </div>
          </div>

          <div className={styles.footer}>
            {/* Replace with your actual Logo image import */}
            <div style={{fontWeight:'bold', opacity:0.5}}>IMS Logo</div> 
            
            <div className={styles.dates}>
              <p>
                <span className={styles.label}>Join</span>
                <span className={styles.value}>: {formatDate(profile.details.joinDate)}</span>
              </p>
              <p>
                <span className={styles.label}>Expire</span>
                <span className={styles.value}>: {getExpiry()}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <button className={styles.printButton} onClick={() => window.print()}>
        <BsPrinter /> Print ID Card
      </button>
    </div>
  );
};

export default IDCardPage;