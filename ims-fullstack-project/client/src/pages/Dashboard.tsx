// client/src/pages/admin/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaChalkboardTeacher, FaLayerGroup, FaUserShield, 
  FaBook, FaCheckSquare, FaFileInvoiceDollar, FaBookReader, FaHandHolding,
  FaCalendarAlt, FaBell, FaClipboardList, FaUserPlus
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './Dashboard.scss';
import { useAuth } from '../context/AuthContext';
import RecentActivity from '../components/Dashboard/RecentActivity';

// --- Interfaces ---
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

// --- Icon Mapping ---
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // Fetch only Dashboard Stats (Cards)
        const dashboardRes = await fetch('http://localhost:5000/api/dashboard', { headers });
        if (dashboardRes.ok) {
            const jsonStats = await dashboardRes.json();
            if (!jsonStats.cards) jsonStats.cards = [];
            setData(jsonStats);
        } else {
            console.error("Failed to fetch dashboard stats");
        }
      } catch (error) {
        console.error("Network Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // --- Skeleton Loader ---
  if (loading) {
      return (
        <div className="dashboard-page">
            <Skeleton variant="rectangular" height={180} style={{borderRadius: '20px', marginBottom: '20px'}} />
            <div className="stats-grid">
                {[1,2,3,4].map((i) => <Skeleton key={i} variant="rectangular" height={120} style={{borderRadius: '16px'}} />)}
            </div>
            <div className="dashboard-content">
                <div className="main-column">
                     <Skeleton variant="rectangular" height={300} style={{borderRadius: '12px'}} />
                </div>
                <div className="side-column">
                    <Skeleton variant="rectangular" height={400} style={{borderRadius: '16px'}} />
                </div>
            </div>
        </div>
      );
  }

  // --- Quick Actions Logic ---
  const renderQuickActions = () => {
      if (!data) return null;
      
      if (data.type === 'ADMIN') {
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
      if (data.type === 'TEACHER') {
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
      if (data.type === 'STUDENT') {
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
      
      {/* 1. Welcome Banner */}
      <div className="welcome-banner">
        <div className="content">
            <h1>Good Morning, {data?.name || user?.email?.split('@')[0]}!</h1>
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
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#888'}}>
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

          {/* Right: Activity Feed (NOW USING COMPONENT) */}
          <div className="side-column">
              <RecentActivity />
          </div>

      </div>
    </div>
  );
};
  
export default Dashboard;