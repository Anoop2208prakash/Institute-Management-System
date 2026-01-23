// client/src/pages/admin/hostel/ManageGatePasses.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaCheck, FaTimes, FaUser, FaClock, FaCalendarAlt, FaSearch, FaTicketAlt } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './ManageGatePasses.scss';
import CustomSelect from '../../../components/common/CustomSelect';
import FeedbackAlert from '../../../components/common/FeedbackAlert';

interface GatePassRequest {
  id: string;
  reason: string;
  outTime: string;
  inTime: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  student: {
    fullName: string;
    admissionNo: string;
    class: { name: string };
    user: { avatar: string };
  };
}

const ManageGatePasses: React.FC = () => {
  const [requests, setRequests] = useState<GatePassRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  const token = localStorage.getItem('token');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/hostel/gatepass/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setRequests(await res.json());
    } catch {
      setAlert({ show: true, msg: 'Failed to load requests', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/hostel/gatepass/${id}/status`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setAlert({ show: true, msg: `Pass ${newStatus.toLowerCase()} successfully`, type: 'success' });
        fetchRequests();
      }
    } catch {
      setAlert({ show: true, msg: 'Update failed', type: 'error' });
    }
  };

  const filteredData = requests.filter(r => {
    const matchesSearch = r.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="manage-gatepass-container">
      <header className="page-header">
        <div className="title-section">
          <div className="icon-badge"><FaTicketAlt /></div>
          <div>
            <h1>Gate Pass Management</h1>
            <p>Review and authorize student movement requests</p>
          </div>
        </div>

        <div className="action-bar">
          <div className="search-box">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search student or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CustomSelect 
            label=""
            value={filterStatus}
            options={[
              { value: 'ALL', label: 'All Requests' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' }
            ]}
            onChange={(e) => setFilterStatus(e.target.value as string)}
          />
        </div>
      </header>

      <div className="requests-grid">
        {loading ? (
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '24px' }} />
        ) : filteredData.length === 0 ? (
          <div className="empty-state">No requests found.</div>
        ) : (
          filteredData.map(req => (
            <div key={req.id} className={`pass-card ${req.status.toLowerCase()}`}>
              <div className="card-top">
                <div className="student-profile">
                  <div className="avatar">
                    {req.student.user.avatar ? 
                      <img src={`http://localhost:5000${req.student.user.avatar}`} alt="" /> : 
                      <FaUser />
                    }
                  </div>
                  <div className="info">
                    <h3>{req.student.fullName}</h3>
                    <span>{req.student.class.name} • {req.student.admissionNo}</span>
                  </div>
                </div>
                <span className={`status-pill ${req.status.toLowerCase()}`}>{req.status}</span>
              </div>

              <div className="card-body">
                <div className="detail-row">
                  <span className="label"><FaCalendarAlt /> Date</span>
                  <span className="val">{new Date(req.date).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="detail-row">
                  <span className="label"><FaClock /> Time Window</span>
                  <span className="val">{req.outTime} - {req.inTime}</span>
                </div>
                <div className="reason-box">
                  <label>Reason</label>
                  <p>{req.reason}</p>
                </div>
              </div>

              {req.status === 'PENDING' && (
                <div className="card-actions">
                  <button className="reject-btn" onClick={() => handleStatusUpdate(req.id, 'REJECTED')}>
                    <FaTimes /> Reject
                  </button>
                  <button className="approve-btn" onClick={() => handleStatusUpdate(req.id, 'APPROVED')}>
                    <FaCheck /> Approve
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <FeedbackAlert isOpen={alert.show} message={alert.msg} type={alert.type} onClose={() => setAlert({...alert, show: false})} />
    </div>
  );
};

export default ManageGatePasses;