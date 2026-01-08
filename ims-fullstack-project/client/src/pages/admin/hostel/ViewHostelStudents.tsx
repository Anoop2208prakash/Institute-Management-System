// client/src/pages/admin/hostel/ViewHostelStudents.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaSearch, FaBuilding, FaBed, FaPhoneAlt, FaCalendarAlt, FaLayerGroup } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './ViewHostelStudents.scss'; 
import CustomSelect from '../../../components/common/CustomSelect';

interface HostelResident {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  hostelName: string;
  roomNumber: string;
  floor: number;
  phone: string;
  admissionDate: string;
  avatar?: string; // Field for student image
}

const ViewHostelStudents: React.FC = () => {
  const [residents, setResidents] = useState<HostelResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('ALL');
  const [filterFloor, setFilterFloor] = useState('ALL'); // New Floor filter
  
  const token = localStorage.getItem('token');

  const fetchResidents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/hostel/all-residents', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setResidents(data);
      }
    } catch (e) {
      console.error("Network error during directory fetch", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchResidents(); }, [fetchResidents]);

  // Combined Filtering Logic
  const filteredData = residents.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = filterBlock === 'ALL' || r.hostelName === filterBlock;
    const matchesFloor = filterFloor === 'ALL' || r.floor.toString() === filterFloor;
    return matchesSearch && matchesBlock && matchesFloor;
  });

  const blockOptions = [
    { value: 'ALL', label: 'All Blocks' },
    ...Array.from(new Set(residents.map(r => r.hostelName))).map(block => ({
      value: block, label: block
    }))
  ];

  // Floor options derived from data
  const floorOptions = [
    { value: 'ALL', label: 'All Floors' },
    ...Array.from(new Set(residents.map(r => r.floor.toString()))).sort().map(f => ({
      value: f, label: `Floor ${f}`
    }))
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="view-hostel-container">
      <header className="page-header">
        <div className="title-section">
          <div>
            <h1>Hostel Student Directory</h1>
            <p>Institutional Housing Registry • {residents.length} Total Residents</p>
          </div>
        </div>

        <div className="action-bar">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filters-group">
            <div className="custom-filter-wrapper">
              <CustomSelect
                label=""
                placeholder="Filter Block"
                value={filterBlock}
                onChange={(e) => setFilterBlock(e.target.value as string)}
                options={blockOptions}
              />
            </div>
            <div className="custom-filter-wrapper">
              <CustomSelect
                label=""
                placeholder="Filter Floor"
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value as string)}
                options={floorOptions}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem' }}>
            <Skeleton variant="rectangular" height={400} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-results">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="residents-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Admission ID</th>
                  <th>Class</th>
                  <th>Hostel Block</th>
                  <th>Allocation</th>
                  <th>Joined Date</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((student) => (
                  <tr key={student.id}>
                    <td className="student-info-cell">
                      <div className="avatar-small">
                        {/* Render image if available, else show initial */}
                        {student.avatar ? (
                          <img 
                            src={`http://localhost:5000${student.avatar}`} 
                            alt={student.name} 
                            onError={(e) => { (e.target as HTMLImageElement).src = ''; }} // Fallback on error
                          />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <strong>{student.name}</strong>
                    </td>
                    <td><code>{student.admissionNo}</code></td>
                    <td>{student.className}</td>
                    <td>
                      <span className="badge-hostel">
                        <FaBuilding /> {student.hostelName}
                      </span>
                    </td>
                    <td>
                      <div className="allocation-info">
                        <span className="badge-room"><FaBed /> Room {student.roomNumber}</span>
                        <span className="floor-label"><FaLayerGroup /> Floor {student.floor}</span>
                      </div>
                    </td>
                    <td>
                      <span className="date-text">
                        <FaCalendarAlt /> {formatDate(student.admissionDate)}
                      </span>
                    </td>
                    <td>
                      <span className="contact-link">
                        <FaPhoneAlt /> {student.phone || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewHostelStudents;