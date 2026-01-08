// client/src/pages/admin/communication/ViewComplaints.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaSearch, FaExclamationCircle, FaCheckCircle, FaClock, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import './ViewComplaints.scss';
import CustomSelect from '../../../components/common/CustomSelect';

interface Complaint {
  id: string;
  studentName: string;
  admissionNo: string;
  subject: string;
  category: string;
  status: 'PENDING' | 'RESOLVED' | 'IN_PROGRESS';
  createdAt: string;
}

const ViewComplaints: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  return (
    <div className="view-complaints-container">
      <header className="page-header">
        <div className="title-section">
          <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /></button>
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
                    <button className="view-details-btn">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewComplaints;