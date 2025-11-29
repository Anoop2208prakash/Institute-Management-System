// client/src/pages/Dashboard.tsx
import React from 'react';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaMoneyBillWave, 
  FaClipboardList, 
  FaPlus,
  FaCalendarAlt 
} from 'react-icons/fa';
import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock Data (In a real app, fetch this from API)
  const stats = [
    { label: 'Total Students', value: '1,250', icon: <FaUserGraduate />, color: 'blue' },
    { label: 'Total Teachers', value: '85', icon: <FaChalkboardTeacher />, color: 'purple' },
    { label: 'Revenue (YTD)', value: '$125k', icon: <FaMoneyBillWave />, color: 'green' },
    { label: 'Attendance', value: '94%', icon: <FaClipboardList />, color: 'orange' },
  ];

  const notices = [
    { day: '29', month: 'Nov', title: 'Mid-Term Exams', desc: 'Schedule for Grade 10-12 released.' },
    { day: '05', month: 'Dec', title: 'Staff Meeting', desc: 'Annual review meeting at 10:00 AM.' },
    { day: '12', month: 'Dec', title: 'Winter Holiday', desc: 'School closed for winter break.' },
  ];

  return (
    <div className="dashboard-container">
      
      {/* 1. Header */}
      <div className="page-header">
        <div>
            <h2>Dashboard</h2>
            <p style={{ color: 'var(--text-muted-color)', marginTop: '0.25rem' }}>
                Welcome back, Super Admin
            </p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* 2. Key Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`icon-box ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Content Split */}
      <div className="content-grid">
        
        {/* Left: Quick Actions (or Charts in future) */}
        <div className="section-card">
          <div className="section-header">
            <h4>Quick Actions</h4>
          </div>
          <div className="action-grid">
            <button className="action-btn" onClick={() => navigate('/staff-register')}>
                <FaPlus />
                <span>Add Staff</span>
            </button>
            <button className="action-btn">
                <FaUserGraduate />
                <span>Admit Student</span>
            </button>
            <button className="action-btn">
                <FaMoneyBillWave />
                <span>Collect Fee</span>
            </button>
            <button className="action-btn">
                <FaCalendarAlt />
                <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* Right: Notice Board */}
        <div className="section-card">
          <div className="section-header">
            <h4>Notice Board</h4>
            <button>View All</button>
          </div>
          <div className="notice-list">
            {notices.map((notice, index) => (
                <div key={index} className="notice-item">
                    <div className="notice-date">
                        <span className="day">{notice.day}</span>
                        <span className="month">{notice.month}</span>
                    </div>
                    <div className="notice-content">
                        <h5>{notice.title}</h5>
                        <p>{notice.desc}</p>
                    </div>
                </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;