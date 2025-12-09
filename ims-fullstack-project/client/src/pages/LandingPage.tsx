// client/src/pages/LandingPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher, FaChartPie, FaRocket, FaShieldAlt, FaMobileAlt } from 'react-icons/fa';
import './LandingPage.scss';
import logo from '../assets/image/logo.png'; 
// import dashboardPreview from '../assets/image/dashboard-preview.png'; 
import { InquiryModal } from '../components/public/InquiryModal'; // <--- Import Modal

const LandingPage: React.FC = () => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false); // <--- State

  return (
    <div className="landing-page">
      <div className="aurora-bg"></div>

      <div className="content-wrapper">
        
        {/* Navbar */}
        <nav className="landing-nav">
          <div className="logo">
            <img src={logo} alt="IMS Logo" />
            <span>IMS Pro</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <button onClick={() => setIsInquiryOpen(true)} style={{background:'none', border:'none', color:'#94a3b8', fontSize:'0.95rem', fontWeight:500, cursor:'pointer'}}>Contact</button>
          </div>
          <Link to="/login" className="btn-login">Login Portal</Link>
        </nav>

        {/* Hero */}
        <section className="hero-section">
          <span className="badge">New: Online Examination Module 🚀</span>
          <h1>
            <span>The Future of</span><br />
            Institute Management
          </h1>
          <p>
            Streamline your entire campus with one powerful platform. 
            From admissions to alumni, we've got you covered with automation and insights.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn-primary">Get Started Now</Link>
            
            {/* Inquiry Button */}
            <button className="btn-secondary" onClick={() => setIsInquiryOpen(true)}>
                Enquire Now
            </button>
          </div>

          {/* <div className="dashboard-preview">
             <img 
                src={dashboardPreview} 
                alt="Dashboard Preview" 
                onError={(e) => e.currentTarget.src = 'https://cdn.dribbble.com/users/411475/screenshots/16866228/media/64f1d4f2025345710609384561081512.png?resize=1600x1200&vertical=center'} 
            />
          </div> */}
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="features-section">
          <div className="section-header">
            <h2>Everything You Need</h2>
            <p>Powerful tools designed for the modern educational ecosystem.</p>
          </div>

          <div className="bento-grid">
            {/* Card 1 (Large) */}
            <div className="bento-card large">
              <div className="icon"><FaRocket /></div>
              <h3>Smart Automation</h3>
              <p>Automate attendance tracking, fee generation, and result processing. Save 100+ hours of administrative work every month.</p>
            </div>

            {/* Card 2 */}
            <div className="bento-card">
              <div className="icon"><FaChartPie /></div>
              <h3>Analytics</h3>
              <p>Real-time insights into student performance and financial health.</p>
            </div>

            {/* Card 3 */}
            <div className="bento-card">
              <div className="icon"><FaShieldAlt /></div>
              <h3>Secure & Safe</h3>
              <p>Role-based access control ensures data privacy for everyone.</p>
            </div>

            {/* Card 4 (Tall) */}
            <div className="bento-card tall">
              <div className="icon"><FaMobileAlt /></div>
              <h3>Mobile Ready</h3>
              <p>Access your dashboard from anywhere. Fully responsive design for tablets and phones, allowing teachers to mark attendance on the go.</p>
            </div>

            {/* Card 5 */}
            <div className="bento-card">
              <div className="icon"><FaChalkboardTeacher /></div>
              <h3>Teacher Tools</h3>
              <p>Manage classes, conduct online tests, and grade assignments effortlessly.</p>
            </div>

             {/* Card 6 */}
             <div className="bento-card">
              <div className="icon"><FaGraduationCap /></div>
              <h3>Student Portal</h3>
              <p>Students can track their own progress, fees, and library loans.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
            <span className="footer-logo">IMS Pro</span>
            <p>© 2025 Institute Management System. All rights reserved.</p>
            <div style={{marginTop: '1rem', display:'flex', gap:'1rem', justifyContent:'center', fontSize:'0.9rem'}}>
                <a href="#" style={{color:'#94a3b8', textDecoration:'none'}}>Privacy</a>
                <a href="#" style={{color:'#94a3b8', textDecoration:'none'}}>Terms</a>
                <a href="#" style={{color:'#94a3b8', textDecoration:'none'}}>Support</a>
            </div>
        </footer>

      </div>

      {/* Inquiry Modal */}
      <InquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </div>
  );
};

export default LandingPage;