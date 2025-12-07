// client/src/pages/student/MyAttendance.tsx
import React, { useState, useEffect } from 'react';
import { FaCheckSquare, FaChartPie, FaTimesCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
// Removed LinearLoader import
import './MyAttendance.scss';

interface AttendanceRecord {
    id: string;
    date: string;
    status: string;
    subject?: { name: string };
}

interface Stats {
    total: number;
    present: number;
    percentage: string;
}

const MyAttendance: React.FC = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, present: 0, percentage: '0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/students/my-attendance', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setHistory(data.history);
            setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch attendance", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const getStatusIcon = (status: string) => {
      if (status === 'PRESENT') return <FaCheckCircle style={{color:'#1a7f37'}} />;
      if (status === 'ABSENT') return <FaTimesCircle style={{color:'#cf222e'}} />;
      return <FaExclamationCircle style={{color:'#d29922'}} />;
  };

  return (
    <div className="student-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaCheckSquare /> My Attendance</h2>
            <p>Track your daily attendance record.</p>
        </div>
      </div>

      <div className="content-wrapper">
            {/* Stats Cards */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="icon blue"><FaChartPie /></div>
                    <div>
                        <h3>{stats.percentage}%</h3>
                        <p>Attendance Rate</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="icon green"><FaCheckCircle /></div>
                    <div>
                        <h3>{stats.present} / {stats.total}</h3>
                        <p>Days Present</p>
                    </div>
                </div>
            </div>

            {/* History List */}
            <div className="list-container">
                <h3 className="section-title">Attendance History</h3>
                
                {/* Loader Removed */}
                
                {!loading && history.length > 0 ? history.map(record => (
                    <div key={record.id} className="list-item">
                        <div className="item-left">
                            {getStatusIcon(record.status)}
                            <div className="details">
                                <span className="date">{new Date(record.date).toLocaleDateString()}</span>
                                {record.subject && <span className="sub-text">{record.subject.name}</span>}
                            </div>
                        </div>
                        <span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span>
                    </div>
                )) : (
                    !loading && <div className="empty-state">No attendance records found.</div>
                )}
            </div>
      </div>
    </div>
  );
};

export default MyAttendance;