// client/src/pages/IDCardPage.tsx
import React, { useState, useEffect } from 'react';
import { BsPersonSquare, BsPrinter } from 'react-icons/bs';
import Skeleton from '@mui/material/Skeleton'; // <--- Import Skeleton
import styles from './IDCardPage.module.scss';
import logo from '../assets/image/logo.png'; 

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
  }
}

const IDCardPage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
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

  // Format Helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getExpiry = () => {
    if (!profile?.details.joinDate) return 'N/A';
    const date = new Date(profile.details.joinDate);
    const years = profile.role === 'student' ? 4 : 5; 
    date.setFullYear(date.getFullYear() + years);
    return date.toLocaleDateString('en-GB');
  }

  // --- SKELETON LOADER COMPONENT ---
  const renderSkeleton = () => (
      <div className={styles.pageContainer}>
        <div className={styles.idCard}>
            <div className={styles.topClip}></div>
            <div className={styles.cardBody}>
                {/* Photo Skeleton */}
                <div className={styles.photo} style={{border: 'none', boxShadow:'none'}}>
                    <Skeleton variant="circular" width={120} height={120} />
                </div>

                <div className={styles.details} style={{width: '100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
                    {/* Name & Title */}
                    <Skeleton variant="text" width="70%" height={40} style={{marginBottom: 5}} />
                    <Skeleton variant="text" width="40%" height={25} style={{marginBottom: 20}} />

                    {/* Info Grid */}
                    <div className={styles.infoGrid} style={{width:'100%'}}>
                        <Skeleton variant="text" width="100%" height={20} />
                        <Skeleton variant="text" width="100%" height={20} />
                        <Skeleton variant="text" width="100%" height={20} />
                        <Skeleton variant="text" width="100%" height={20} />
                    </div>
                </div>

                <div className={styles.footer} style={{width:'100%', justifyContent:'space-between'}}>
                    <Skeleton variant="rectangular" width={50} height={50} />
                    <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
                        <Skeleton variant="text" width={80} height={15} />
                        <Skeleton variant="text" width={80} height={15} />
                    </div>
                </div>
            </div>
        </div>
      </div>
  );

  if (loading) return renderSkeleton();

  if (!profile) return <div style={{padding: '2rem', textAlign: 'center'}}>Profile not found. Please log in.</div>;

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
            <img src={logo} alt="IMS" className={styles.companyLogo} />
            
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
        <BsPrinter style={{marginRight: '8px'}}/> Print ID Card
      </button>
    </div>
  );
};

export default IDCardPage;