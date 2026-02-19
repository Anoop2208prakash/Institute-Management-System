import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SystemLogsPage.scss';

interface LogEntry {
  id: string;
  type: 'LIBRARY' | 'COMPLAINT' | 'SYSTEM';
  message: string;
  date: string;
}

const SystemLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLogs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="loading-state">Loading system activities...</div>;

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h1>System Activity Logs</h1>
        <p>A real-time timeline of campus operations and user activities.</p>
        <button className="refresh-btn" onClick={fetchLogs}>Refresh Logs</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="timeline-wrapper">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className={`log-item ${log.type.toLowerCase()}`}>
              <div className="indicator-col">
                <div className="status-dot"></div>
                <div className="vertical-line"></div>
              </div>
              <div className="log-body">
                <div className="log-meta">
                  <span className="type-badge">{log.type}</span>
                  <span className="timestamp">
                    {new Date(log.date).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                <p className="log-msg">{log.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No recent activities found.</div>
        )}
      </div>

      {showScrollButton && (
        <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
          ↑
        </button>
      )}
    </div>
  );
};

export default SystemLogsPage;