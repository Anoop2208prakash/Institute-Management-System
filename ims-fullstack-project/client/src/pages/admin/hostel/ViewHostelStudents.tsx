// client/src/pages/admin/hostel/ViewHostelStudents.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  FaSearch, FaBuilding, FaBed, FaPhoneAlt, 
  FaCalendarAlt, FaLayerGroup, FaUserGraduate 
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './ViewHostelStudents.scss'; 
import CustomSelect from '../../../components/common/CustomSelect';
import CommonPagination from '../../../components/common/CommonPagination';

interface HostelResident {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  hostelName: string;
  roomNumber: string;
  floor: number | null;
  phone: string;
  admissionDate: string;
  avatar?: string;
}

const ViewHostelStudents: React.FC = () => {
  const [residents, setResidents] = useState<HostelResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('ALL');
  const [filterFloor, setFilterFloor] = useState('ALL');
  
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const filteredData = useMemo(() => {
    return residents.filter(r => {
      const name = r.name?.toLowerCase() || '';
      const id = r.admissionNo?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = name.includes(search) || id.includes(search);
      const matchesBlock = filterBlock === 'ALL' || r.hostelName === filterBlock;
      
      const currentFloorStr = r.floor !== null && r.floor !== undefined ? r.floor.toString() : 'N/A';
      const matchesFloor = filterFloor === 'ALL' || currentFloorStr === filterFloor;
      
      return matchesSearch && matchesBlock && matchesFloor;
    });
  }, [residents, searchTerm, filterBlock, filterFloor]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const blockOptions = useMemo(() => [
    { value: 'ALL', label: 'All Blocks' },
    ...Array.from(new Set(residents.map(r => r.hostelName))).filter(Boolean).map(block => ({
      value: block, label: block
    }))
  ], [residents]);

  const floorOptions = useMemo(() => [
    { value: 'ALL', label: 'All Floors' },
    ...Array.from(new Set(residents.map(r => r.floor?.toString()))).filter(f => f !== "undefined" && f !== "null").sort().map(f => ({
      value: f!, label: `Floor ${f}`
    }))
  ], [residents]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="view-hostel-container">
      <header className="page-header">
        <div className="title-section">
          <h1>Hostel Student Directory</h1>
          <p>Institutional Housing Registry • {filteredData.length} Residents Found</p>
        </div>

        <div className="action-bar">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search name or ID..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          
          <div className="filters-group">
            <CustomSelect
              label=""
              value={filterBlock}
              onChange={(e) => handleFilterChange(setFilterBlock, e.target.value as string)}
              options={blockOptions}
            />
            <CustomSelect
              label=""
              value={filterFloor}
              onChange={(e) => handleFilterChange(setFilterFloor, e.target.value as string)}
              options={floorOptions}
            />
          </div>
        </div>
      </header>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem' }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '16px' }} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-results">
            <FaUserGraduate size={50} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No students matching your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive desktop-only">
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
                  {paginatedData.map((student) => (
                    <tr key={student.id}>
                      <td className="student-info-cell">
                        <div className="avatar-small">
                          {/* FIXED: Using absolute Cloudinary URL directly */}
                          {student.avatar ? (
                            <img 
                              src={student.avatar} 
                              alt={student.name} 
                              onError={(e) => { 
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${student.name}&background=random`; 
                              }}
                            />
                          ) : (
                            student.name?.charAt(0) || '?'
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
                          <span className="badge-room"><FaBed /> Room {student.roomNumber || 'N/A'}</span>
                          <span className="floor-label"><FaLayerGroup /> Floor {student.floor ?? 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="date-text">
                          <FaCalendarAlt /> {formatDate(student.admissionDate)}
                        </span>
                      </td>
                      <td>
                        <a href={`tel:${student.phone}`} className="contact-link">
                          <FaPhoneAlt /> {student.phone || 'N/A'}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-resident-grid">
              {paginatedData.map((student) => (
                <div key={student.id} className="resident-mobile-card">
                  <div className="card-header">
                    <div className="avatar-small">
                      {/* FIXED: Using absolute Cloudinary URL directly */}
                      {student.avatar ? (
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          onError={(e) => { 
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${student.name}&background=random`; 
                          }}
                        />
                      ) : (student.name?.charAt(0) || '?')}
                    </div>
                    <div className="name-meta">
                      <strong>{student.name}</strong>
                      <span>{student.className} • {student.admissionNo}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="label"><FaBuilding /> Block:</span>
                      <span className="value">{student.hostelName}</span>
                    </div>
                    <div className="info-row">
                      <span className="label"><FaBed /> Room:</span>
                      <span className="value">{student.roomNumber || 'N/A'} (Floor {student.floor ?? 'N/A'})</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <a href={`tel:${student.phone}`} className="contact-btn">
                      <FaPhoneAlt /> Call Student
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination-footer">
              <CommonPagination 
                totalCount={filteredData.length}
                pageSize={pageSize}
                currentPage={page}
                onPageChange={(_, val) => setPage(val)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewHostelStudents;