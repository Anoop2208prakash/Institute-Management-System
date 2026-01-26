// client/src/pages/admin/hostel/RoomAllocation.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  FaUserGraduate, FaArrowRight, FaSearch,
  FaBuilding, FaDoorOpen, FaCheckCircle, FaLayerGroup, FaTimes, FaSyncAlt, FaUserCircle
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './RoomAllocation.scss';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import CommonPagination from '../../../components/common/CommonPagination';

// Interfaces defined before the component to ensure scope
interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupiedCount: number;
  hostelName: string;
}

interface Student {
  studentId: string;
  name: string;
  admissionNo: string;
  gender: string;
  className: string;
  avatar: string | null; // FIXED: Added avatar field for Cloudinary support
}

const RoomAllocation: React.FC = () => {
  // --- State Management ---
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async (isManualSync = false) => {
    if (!token) return;
    if (isManualSync) setIsSyncing(true);
    else setLoading(true);

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [roomRes, studentRes] = await Promise.all([
        fetch('http://localhost:5000/api/hostel/rooms/available', { headers }),
        fetch('http://localhost:5000/api/hostel/pending', { headers })
      ]);

      if (!roomRes.ok || !studentRes.ok) throw new Error(`Sync Error: ${roomRes.status}`);

      const roomsData = await roomRes.json();
      const studentsData = await studentRes.json();

      setRooms(roomsData);
      setFilteredRooms(roomsData);
      setStudents(studentsData);
      setPage(1);

    } catch (error: any) {
      setAlert({ show: true, msg: error.message || 'Connectivity issue', type: 'error' });
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Search Filter Logic
  useEffect(() => {
    const query = searchTerm.toLowerCase();
    const filtered = rooms.filter(room =>
      room.roomNumber.toLowerCase().includes(query) ||
      room.hostelName.toLowerCase().includes(query)
    );
    setFilteredRooms(filtered);
    setPage(1);
  }, [searchTerm, rooms]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const currentRooms = filteredRooms.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleAllocate = async (roomId: string) => {
    if (!selectedStudent) return;
    try {
      const res = await fetch('http://localhost:5000/api/hostel/allocate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent.studentId, roomId })
      });

      if (res.ok) {
        setAlert({ show: true, msg: `Successfully assigned ${selectedStudent.name}`, type: 'success' });
        setSelectedStudent(null);
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Allocation failed.');
      }
    } catch (error: any) {
      setAlert({ show: true, msg: error.message, type: 'error' });
    }
  };

  return (
    <div className="modern-allocation-container">
      <header className="allocation-header">
        <div className="header-info">
          <h2><FaLayerGroup /> Room Allocation Workspace</h2>
          <p>Assigning residential spaces to {students.length} pending students.</p>
        </div>
        <button
          className={`refresh-data-btn ${isSyncing ? 'spinning' : ''}`}
          onClick={() => fetchData(true)}
          disabled={isSyncing || loading}
        >
          <FaSyncAlt /> {isSyncing ? 'Syncing...' : 'Refresh Data'}
        </button>
      </header>

      <div className="allocation-grid">
        <aside className="student-sidebar">
          <div className="sidebar-title">
            <div className="title-text"><FaUserGraduate /> Students</div>
            <span className="count-badge">{students.length}</span>
          </div>
          <div className="student-list">
            {loading ? (
              [1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={70} sx={{ borderRadius: '1rem', mb: 1.5 }} />)
            ) : (
              students.map(student => (
                <div
                  key={student.studentId}
                  className={`student-item ${selectedStudent?.studentId === student.studentId ? 'selected' : ''}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  {/* FIXED: Avatar logic for Cloudinary absolute URLs */}
                  <div className="avatar-preview">
                    {student.avatar ? (
                      <img 
                        src={student.avatar} 
                        alt="" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${student.name}&background=random`;
                        }}
                      />
                    ) : (
                      <FaUserCircle className="placeholder-icon" />
                    )}
                  </div>
                  <div className="info">
                    <strong>{student.name}</strong>
                    <span>{student.admissionNo} • {student.gender}</span>
                  </div>
                  {selectedStudent?.studentId === student.studentId ? <FaTimes className="deselect-icon" /> : <FaCheckCircle className="active-icon" />}
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="room-explorer">
          <div className="explorer-header">
            <h3><FaBuilding /> Available Rooms</h3>
            <div className="search-box">
              <FaSearch />
              <input
                placeholder="Search rooms or wings..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="workspace-wrapper">
            {!selectedStudent && !loading && (
              <div className="glass-overlay">
                <div className="overlay-content">
                  <div className="icon-circle">
                    <FaUserGraduate className="bounce-icon" />
                  </div>
                  <h4>Select a Student First</h4>
                  <p>Choose a student from the sidebar to activate the room assignment grid.</p>
                </div>
              </div>
            )}

            <div className={`rooms-container ${loading || !selectedStudent ? 'dimmed' : ''}`}>
              {loading ? (
                [1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={220} sx={{ borderRadius: '1.5rem' }} />)
              ) : (
                currentRooms.map(room => {
                  const occupancyRate = (room.occupiedCount / room.capacity) * 100;
                  const isFull = room.occupiedCount >= room.capacity;

                  return (
                    <div key={room.id} className="room-card glass-style">
                      <div className="room-header">
                        <span className="room-no"><FaDoorOpen /> {room.roomNumber}</span>
                        <span className="floor-tag">Floor {room.floor}</span>
                      </div>
                      <div className="hostel-ref"><FaBuilding /> {room.hostelName}</div>

                      <div className="occupancy-info">
                        <div className="occupancy-header">
                          <span>Beds: {room.occupiedCount} / {room.capacity}</span>
                          <span className={`status ${isFull ? 'full' : 'available'}`}>
                            {isFull ? 'Full' : 'Available'}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div className="fill" style={{ width: `${occupancyRate}%` }}></div>
                        </div>
                      </div>

                      <button
                        disabled={!selectedStudent || isFull}
                        onClick={() => handleAllocate(room.id)}
                        className="btn-assign"
                      >
                        {isFull ? 'Room Full' : 'Assign to Student'} <FaArrowRight />
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {!loading && filteredRooms.length > 0 && (
              <div className="pagination-wrapper">
                <CommonPagination
                  totalCount={filteredRooms.length}
                  pageSize={rowsPerPage}
                  currentPage={page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      <FeedbackAlert isOpen={alert.show} message={alert.msg} type={alert.type} onClose={() => setAlert(p => ({ ...p, show: false }))} />
    </div>
  );
};

export default RoomAllocation;