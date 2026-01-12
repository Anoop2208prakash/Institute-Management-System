// client/src/pages/admin/communication/ViewComplaints.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  FaSearch, FaExclamationCircle, FaCheckCircle,
  FaClock, FaTimes, FaUser, FaTag, FaCalendarAlt
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './ViewComplaints.scss';
import CustomSelect from '../../../components/common/CustomSelect';
import FeedbackAlert from '../../../components/common/FeedbackAlert';

interface Complaint {
  id: string;
  studentName: string;
  admissionNo: string;
  subject: string;
  category: string;
  description: string; // Added field
  status: 'PENDING' | 'RESOLVED' | 'IN_PROGRESS';
  createdAt: string;
}

const ViewComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  const token = localStorage.getItem('token');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/communication/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setComplaints(await res.json());
    } catch (e) {
      console.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // Handle Status Update
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedComplaint) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/communication/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setAlert({ show: true, msg: 'Status updated successfully', type: 'success' });
        setSelectedComplaint({ ...selectedComplaint, status: newStatus as any });
        fetchComplaints(); // Refresh list
      }
    } catch (error) {
      setAlert({ show: true, msg: 'Update failed', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredData = complaints.filter(c => {
    const matchesSearch = c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
  ];

  const updateOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'Mark In Progress' },
    { value: 'RESOLVED', label: 'Mark Resolved' },
  ];

  return (
    <div className="view-complaints-container">
      <header className="page-header">
        <div className="title-section">
          <div>
            <h1>Grievance Redressal</h1>
            <p>Communication Module • {complaints.length} Total Complaints</p>
          </div>
        </div>

        <div className="action-bar">
          <div className="search-input-wrapper">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="custom-filter-wrapper">
            <CustomSelect
              label=""
              placeholder="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string)}
              options={statusOptions}
            />
          </div>
        </div>
      </header>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem' }}><Skeleton variant="rectangular" height={400} /></div>
        ) : (
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Complainant</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="user-info">
                    <strong>{item.studentName}</strong>
                    <span>{item.admissionNo}</span>
                  </td>
                  <td>{item.subject}</td>
                  <td><span className="cat-tag">{item.category}</span></td>
                  <td>{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                      {item.status === 'PENDING' && <FaClock />}
                      {item.status === 'IN_PROGRESS' && <FaExclamationCircle />}
                      {item.status === 'RESOLVED' && <FaCheckCircle />}
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedComplaint(item)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="glass-modal detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Complaint Details</h3>
              <button className="close-x-btn" onClick={() => setSelectedComplaint(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="detail-body">
              <div className="info-grid">
                <div className="info-item">
                  <FaUser className="icon" />
                  <div>
                    <label>Complainant</label>
                    <p>{selectedComplaint.studentName} ({selectedComplaint.admissionNo})</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaTag className="icon" />
                  <div>
                    <label>Category</label>
                    <p>{selectedComplaint.category}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaCalendarAlt className="icon" />
                  <div>
                    <label>Submitted On</label>
                    <p>{new Date(selectedComplaint.createdAt).toLocaleString('en-GB')}</p>
                  </div>
                </div>
              </div>

              <div className="description-section">
                <label>Subject</label>
                <h4>{selectedComplaint.subject}</h4>
                <label>Full Description</label>
                <div className="description-box">
                  {selectedComplaint.description || "No detailed description provided."}
                </div>
              </div>

              <div className="status-update-section">
                <label>Update Complaint Status</label>
                <div className="update-controls">
                  <CustomSelect
                    label=""
                    value={selectedComplaint.status}
                    options={updateOptions}
                    onChange={(e) => handleUpdateStatus(e.target.value as string)}
                    disabled={isUpdating}
                  />
                  <div className={`current-status-tag ${selectedComplaint.status.toLowerCase()}`}>
                    Currently: {selectedComplaint.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <FeedbackAlert
        isOpen={alert.show}
        message={alert.msg}
        type={alert.type}
        onClose={() => setAlert(p => ({ ...p, show: false }))}
      />
    </div>
  );
};

export default ViewComplaints;