// client/src/pages/LandingPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaGraduationCap, FaArrowRight, FaUser, 
  FaTicketAlt, FaShieldAlt, FaCreditCard, FaChevronRight 
} from 'react-icons/fa';
import InquiryModal from '../components/common/InquiryModal';
import FeedbackAlert from '../components/common/FeedbackAlert'; 
import { type AlertColor } from '@mui/material/Alert'; 
import './LandingPage.scss';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  // --- FEEDBACK ALERT STATE ---
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  return (
    <div className="landing-page">
      
      {/* === ALERT COMPONENT === */}
      <FeedbackAlert 
        isOpen={alertInfo.show} 
        type={alertInfo.type} 
        message={alertInfo.msg} 
        onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
      />

      {/* === NAVBAR === */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="brand">
            <div className="logo-icon">
              <FaGraduationCap />
            </div>
            <span>IMS <span className="highlight">Portal</span></span>
          </div>

          <div className="nav-links">
            <a href="#features">Inquiries</a>
            <a href="#about">Facilities</a>
            <a href="#contact">Support</a>
          </div>

          <div className="nav-actions">
            <button className="btn-signin" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* === HERO SECTION === */}
      <section className="hero-section">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="badge">
              <span className="dot"></span>
              <span>Official Institute Portal</span>
            </div>
            
            <h2>Welcome to</h2>
            <h1>
              Institute Management <br />
              <span className="highlight">System</span>
            </h1>
            
            <p>
              Elevating the student experience. Manage your gate passes, complaints, fees, and academic progress seamlessly with our smart management system.
            </p>
            
            <div className="cta-group">
              <Link to="/login" className="btn-primary">
                Login to Portal <FaArrowRight />
              </Link>
              <button className="btn-outline" onClick={() => setIsInquiryOpen(true)}>
                Inquiries
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glass-card">
               <div className="card-header">
                 <div className="user">
                   <div className="avatar"><FaUser /></div>
                   <div>
                     <p>VIshnu Nair</p>
                     <p>BCA</p>
                   </div>
                 </div>
                 <div className="status">Authorized</div>
               </div>

               <div className="stats-row">
                 <div className="stat">
                   <label>Marks</label>
                   <span>89%</span>
                 </div>
                 <div className="stat">
                   <label>Attendance</label>
                   <span>95%</span>
                 </div>
               </div>

               <button className="card-btn">Open Dashboard</button>
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section id="features" className="features-section">
          <div className="header">
            <h2>Smart Campus. Smarter Living.</h2>
            <p>
              Experience a fully digital campus life. Say goodbye to paperwork and long queues.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard 
              icon={FaTicketAlt}
              title="E-Gate Pass System"
              description="Apply for outings or leave directly from your phone. Parents and wardens get instant notifications for approval."
            />
            <FeatureCard 
              icon={FaShieldAlt}
              title="24/7 Grievance Cell"
              description="Facing maintenance issues? Lodge a complaint instantly and track the resolution progress in real-time."
            />
            <FeatureCard 
              icon={FaCreditCard}
              title="Digital Fee Payment"
              description="Pay your hostel and academic fees securely via the integrated payment gateway with instant receipt generation."
            />
          </div>
      </section>

      {/* === FOOTER === */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.5rem'}}>
              <div style={{width:'32px', height:'32px', background:'#D7F2F7', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#354D62'}}>
                <FaGraduationCap />
              </div>
              <span style={{fontSize:'1.5rem', fontWeight:'700'}}>IMS Pro</span>
            </div>
            <p>
              Providing a safe, secure, and smart environment for the leaders of tomorrow.
            </p>
          </div>
          
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/login"><FaChevronRight style={{fontSize:'0.7rem', marginRight:'5px'}}/> Student Login</Link></li>
              <li><Link to="/login"><FaChevronRight style={{fontSize:'0.7rem', marginRight:'5px'}}/> Admin Portal</Link></li>
              <li><a href="#"><FaChevronRight style={{fontSize:'0.7rem', marginRight:'5px'}}/> Hostel Rules</a></li>
            </ul>
          </div>
          
          <div>
            <h4>Contact Support</h4>
            <ul>
              <li><span style={{opacity:0.8}}>Chief Warden:</span> +91 98765 43210</li>
              <li><span style={{opacity:0.8}}>Email:</span> support@ims-pro.edu</li>
            </ul>
          </div>
        </div>
        
        <div className="copyright">
          <p>© Anoop Prakash, 2025 Institute Management System. All rights reserved.</p>
          <div className="links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* --- FIX: Added 'showAlert' prop here --- */}
      <InquiryModal 
        isOpen={isInquiryOpen} 
        onClose={() => setIsInquiryOpen(false)} 
        showAlert={showAlert} 
      />
    </div>
  );
};

// --- HELPER COMPONENT ---
const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="feature-card">
    <div className="icon">
      <Icon />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
    <div style={{marginTop:'1.5rem', fontSize:'0.9rem', fontWeight:'700', color:'#354D62', display:'flex', alignItems:'center', cursor:'pointer', opacity:0.7}}>
      Learn more <FaArrowRight style={{marginLeft:'5px', fontSize:'0.8rem'}} />
    </div>
  </div>
);

export default LandingPage;