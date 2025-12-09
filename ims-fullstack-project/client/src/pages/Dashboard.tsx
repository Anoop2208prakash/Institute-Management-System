// client/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaChalkboardTeacher, FaLayerGroup, FaUserShield, 
  FaBook, FaCheckSquare, FaFileInvoiceDollar, FaBookReader, FaHandHolding,
  FaCalendarAlt, FaBell, FaClipboardList, FaUserPlus
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton'; // <--- Import Skeleton
import { useAuth } from '../context/AuthContext';
import './Dashboard.scss';

// Icon Mapping
const iconMap: Record<string, React.ReactElement> = {
  'users': <FaUsers />,
  'chalkboard-teacher': <FaChalkboardTeacher />,
  'layer-group': <FaLayerGroup />,
  'user-shield': <FaUserShield />,
  'book': <FaBook />,
  'check-square': <FaCheckSquare />,
  'file-invoice-dollar': <FaFileInvoiceDollar />,
  'book-reader': <FaBookReader />,
  'hand-holding': <FaHandHolding />
};

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface DashboardData {
  type: string;
  name?: string;
  cards: StatCard[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const jsonData = await res.json();
            if (!jsonData.cards) jsonData.cards = [];
            setData(jsonData as DashboardData);
        }
      } catch (e) {
        console.error("Dashboard Error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- SKELETON LOADER UI ---
  if (loading) {
      return (
        <div className="dashboard-page">
            {/* Banner Skeleton */}
            <Skeleton variant="rectangular" height={180} style={{borderRadius: '20px'}} />
            
            {/* Stats Grid Skeleton */}
            <div className="stats-grid">
                {Array.from(new Array(4)).map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={120} style={{borderRadius: '16px'}} />
                ))}
            </div>

            <div className="dashboard-content">
                {/* Left Column Skeleton */}
                <div className="main-column">
                    <div className="quick-actions" style={{height: '300px', border:'none', background:'none'}}>
                         <Skeleton variant="text" width="40%" height={40} style={{marginBottom: 20}} />
                         <div className="actions-grid">
                             {Array.from(new Array(4)).map((_, i) => (
                                 <Skeleton key={i} variant="rectangular" height={120} style={{borderRadius: '12px'}} />
                             ))}
                         </div>
                    </div>
                </div>
                {/* Right Column Skeleton */}
                <div className="side-column">
                    <Skeleton variant="rectangular" height={400} style={{borderRadius: '16px'}} />
                </div>
            </div>
        </div>
      );
  }

  // Define Quick Actions based on Role
  const renderQuickActions = () => {
      if (data?.type === 'ADMIN') {
          return (
              <>
                  <button onClick={() => navigate('/new-admission')}>
                      <FaUserPlus /> <span>New Admission</span>
                  </button>
                  <button onClick={() => navigate('/staff')}>
                      <FaChalkboardTeacher /> <span>Manage Staff</span>
                  </button>
                  <button onClick={() => navigate('/programs')}>
                      <FaLayerGroup /> <span>Programs</span>
                  </button>
                  <button onClick={() => navigate('/announcements')}>
                      <FaBell /> <span>Post Notice</span>
                  </button>
              </>
          );
      }
      if (data?.type === 'TEACHER') {
        return (
            <>
                <button onClick={() => navigate('/attendance')}>
                    <FaCheckSquare /> <span>Attendance</span>
                </button>
                <button onClick={() => navigate('/online-tests')}>
                    <FaClipboardList /> <span>Online Tests</span>
                </button>
                <button onClick={() => navigate('/teacher-subjects')}>
                    <FaBook /> <span>My Subjects</span>
                </button>
            </>
        );
      }
      if (data?.type === 'STUDENT') {
          return (
            <>
                <button onClick={() => navigate('/my-attendance')}>
                    <FaCheckSquare /> <span>My Attendance</span>
                </button>
                <button onClick={() => navigate('/my-results')}>
                    <FaClipboardList /> <span>Results</span>
                </button>
                <button onClick={() => navigate('/stationery')}>
                    <FaBook /> <span>Stationery</span>
                </button>
            </>
          );
      }
      return null;
  };

  return (
    <div className="dashboard-page">
      
      {/* 1. Modern Welcome Banner */}
      <div className="welcome-banner">
        <div className="content">
            <h1>Good Morning, {data?.name || user?.email.split('@')[0]}!</h1>
            <p>Here's what's happening in your institute today.</p>
        </div>
        <div className="date-badge">
            <FaCalendarAlt />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="stats-grid">
        {data?.cards && data.cards.length > 0 ? (
            data.cards.map((card, idx) => (
            <div key={idx} className="stat-card">
                <div 
                className="icon-wrapper" 
                style={{ backgroundColor: `${card.color}15`, color: card.color }}
                >
                {iconMap[card.icon] || <FaLayerGroup />}
                </div>
                <div className="info">
                <span className="label">{card.label}</span>
                <span className="value">{card.value}</span>
                </div>
            </div>
            ))
        ) : (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted-color)'}}>
                No statistics available.
            </div>
        )}
      </div>

      {/* 3. Main Content Split */}
      <div className="dashboard-content">
          
          {/* Left: Quick Actions */}
          <div className="main-column">
              <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="actions-grid">
                      {renderQuickActions()}
                  </div>
              </div>
          </div>

          {/* Right: Activity Feed (Static Mockup for Now) */}
          <div className="side-column">
              <div className="activity-feed">
                  <h3>Recent Activity</h3>
                  <div className="feed-list">
                      <div className="feed-item">
                          <div className="feed-icon"><FaBell /></div>
                          <div className="feed-content">
                              <h4>System Update</h4>
                              <p>The system was successfully updated to v2.0.</p>
                              <span className="time">2 hours ago</span>
                          </div>
                      </div>
                      <div className="feed-item">
                          <div className="feed-icon" style={{color:'#1a7f37', background:'rgba(26,127,55,0.1)'}}><FaUsers /></div>
                          <div className="feed-content">
                              <h4>New Admissions</h4>
                              <p>5 new students were admitted to Grade 10.</p>
                              <span className="time">Yesterday</span>
                          </div>
                      </div>
                      <div className="feed-item">
                          <div className="feed-icon" style={{color:'#cf222e', background:'rgba(207,34,46,0.1)'}}><FaFileInvoiceDollar /></div>
                          <div className="feed-content">
                              <h4>Fee Collection</h4>
                              <p>Monthly fee generation completed.</p>
                              <span className="time">2 days ago</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};
  
export default Dashboard;