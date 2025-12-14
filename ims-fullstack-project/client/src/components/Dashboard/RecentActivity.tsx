// client/src/components/dashboard/RecentActivity.tsx
import React, { useState, useEffect } from 'react';
import { FaHistory, FaFileInvoiceDollar, FaUserPlus, FaClipboardList, FaExclamationCircle, FaBell } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './RecentActivity.scss';

// Match the Interface to your Dashboard's original data
interface ActivityItem {
  id: number;
  action: string;
  message: string;
  createdAt: string;
}

const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      try {
        // CORRECTED ENDPOINT: /api/activity (instead of /api/dashboard/activity)
        const res = await fetch('http://localhost:5000/api/activity', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, []);

  // Use your original icon logic based on the action string
  const getActivityIcon = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('fee') || lower.includes('payment')) return <FaFileInvoiceDollar className="icon danger" />;
    if (lower.includes('admission') || lower.includes('register')) return <FaUserPlus className="icon success" />;
    if (lower.includes('exam') || lower.includes('test')) return <FaClipboardList className="icon primary" />;
    if (lower.includes('error')) return <FaExclamationCircle className="icon danger" />;
    return <FaBell className="icon warning" />;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="recent-activity-card">
      <div className="card-header">
        <h3><FaHistory /> Recent Activity</h3>
      </div>
      
      <div className="activity-list">
        {isLoading ? (
          Array.from(new Array(2)).map((_, i) => (
            <div key={i} className="activity-item">
               <Skeleton variant="circular" width={32} height={32} />
               <div className="content" style={{width: '100%'}}>
                 <Skeleton variant="text" width="60%" />
                 <Skeleton variant="text" width="40%" height={14} />
               </div>
            </div>
          ))
        ) : error ? (
          <div className="empty-state">Unable to load activities.</div>
        ) : activities.length > 0 ? (
          // Display up to 10 items
          activities.slice(0, 10).map((act) => (
            <div key={act.id} className="activity-item">
              <div className="icon-wrapper">
                {getActivityIcon(act.action)}
              </div>
              <div className="content">
                {/* Render Action and Message properly */}
                <p className="action">
                  <span className="user">{act.action}</span>
                </p>
                <p className="message" style={{margin:'0 0 4px 0', fontSize:'0.85rem', color:'var(--text-muted-color)'}}>
                    {act.message}
                </p>
                <span className="time">{formatDate(act.createdAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No recent activity found.</div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;