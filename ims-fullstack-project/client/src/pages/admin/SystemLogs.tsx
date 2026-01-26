// client/src/pages/admin/SystemLogs.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaTerminal, FaSearch, FaFileExport, FaTrashAlt, FaPlusCircle, FaSyncAlt } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './SystemLogs.scss';

interface SystemLog {
  id: string;
  action: string;
  message: string;
  createdAt: string;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  // Fetch function aligned with your backend activityRoute
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/activities', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error("Audit fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Filtering Logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const getActionStyles = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return { class: 'log-create', icon: <FaPlusCircle /> };
      case 'DELETE': return { class: 'log-delete', icon: <FaTrashAlt /> };
      case 'UPDATE': return { class: 'log-update', icon: <FaSyncAlt /> };
      default: return { class: 'log-info', icon: <FaTerminal /> };
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Action,Details\n"
      + filteredLogs.map(l => `${l.createdAt},${l.action},"${l.message}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `system_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="logs-page">
      <header className="page-header">
        <div className="title-area">
          <div className="icon-box"><FaTerminal /></div>
          <div>
            <h1>System Audit Logs</h1>
            <p>Tracking {logs.length} administrative activities across the platform.</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-bar">
            <FaSearch />
            <input 
              placeholder="Search details or actions..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <select 
            className="action-filter"
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">Creates</option>
            <option value="UPDATE">Updates</option>
            <option value="DELETE">Deletions</option>
          </select>

          <button className="export-btn" onClick={handleExport} title="Download CSV">
            <FaFileExport /> Export
          </button>
        </div>
      </header>

      <div className="logs-container card-shadow">
        {loading ? (
          <div className="skeleton-list">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="skeleton-row">
                <Skeleton variant="text" width="20%" height={40} />
                <Skeleton variant="rectangular" width="10%" height={25} sx={{ borderRadius: '20px' }} />
                <Skeleton variant="text" width="65%" height={40} />
              </div>
            ))}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Audit Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan={3} className="empty-state">No matching logs found for your criteria.</td></tr>
                ) : filteredLogs.map(log => {
                  const styles = getActionStyles(log.action);
                  return (
                    <tr key={log.id}>
                      <td className="time-cell">
                        <span className="date-main">
                          {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="time-sub">
                          {new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>
                      <td className="action-cell">
                        <span className={`action-badge ${styles.class}`}>
                          {styles.icon} {log.action}
                        </span>
                      </td>
                      <td className="message-cell">
                        <div className="message-text">{log.message}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;