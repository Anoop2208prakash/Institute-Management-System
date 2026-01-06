// client/src/pages/admin/hostel/RoomAllocation.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
    FaBed, FaUserGraduate, FaArrowRight, FaSearch, 
    FaBuilding, FaDoorOpen, FaCheckCircle, FaLayerGroup, FaTimes
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './RoomAllocation.scss';
import FeedbackAlert from '../../../components/common/FeedbackAlert';

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
}

const RoomAllocation: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  const token = localStorage.getItem('token');

  // 1. Fetch data from API
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [roomRes, studentRes] = await Promise.all([
        fetch('http://localhost:5000/api/hostel/rooms/available', { headers }),
        fetch('http://localhost:5000/api/hostel/pending', { headers })
      ]);

      if (!roomRes.ok || !studentRes.ok) {
          throw new Error(`Sync Error: Status ${roomRes.status}`);
      }

      const roomsData = await roomRes.json();
      const studentsData = await studentRes.json();

      setRooms(roomsData);
      setFilteredRooms(roomsData);
      setStudents(studentsData);
    } catch (error: any) {
      setAlert({ show: true, msg: error.message || 'Connectivity issue', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2. Search Filter Logic
  useEffect(() => {
      const query = searchTerm.toLowerCase();
      const filtered = rooms.filter(room => 
        room.roomNumber.toLowerCase().includes(query) || 
        room.hostelName.toLowerCase().includes(query)
      );
      setFilteredRooms(filtered);
  }, [searchTerm, rooms]);

  // 3. Allocation Action
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
      <div className="allocation-header">
        <h2><FaLayerGroup /> Room Allocation Workspace</h2>
        <p>Assigning residential spaces to {students.length} pending students.</p>
      </div>

      <div className="allocation-grid">
        <aside className="student-sidebar">
          <div className="sidebar-title">
            <div className="title-text"><FaUserGraduate /> Students</div>
            <span className="count-badge">{students.length}</span>
          </div>
          <div className="student-list">
            {loading ? (
                [1, 2].map(i => <Skeleton key={i} variant="rectangular" height={70} sx={{ borderRadius: '1rem', mb: 1 }} />)
            ) : students.length === 0 ? (
                <div className="empty-list">All residential requests processed.</div>
            ) : (
                students.map(student => (
                <div 
                    key={student.studentId} 
                    className={`student-item ${selectedStudent?.studentId === student.studentId ? 'selected' : ''}`}
                    onClick={() => setSelectedStudent(student)}
                >
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
            {/* GLASS OVERLAY: Fixes the layout push issue */}
            {!selectedStudent && !loading && (
              <div className="glass-overlay">
                <div className="overlay-content">
                  <FaUserGraduate className="bounce-icon" />
                  <h4>Select a Student First</h4>
                  <p>Choose a student from the sidebar to activate the room assignment grid.</p>
                </div>
              </div>
            )}

            <div className={`rooms-container ${loading ? 'loading' : ''}`}>
              {loading ? (
                  [1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={220} sx={{ borderRadius: '1rem' }} />)
              ) : filteredRooms.map(room => {
                  const occupancyRate = (room.occupiedCount / room.capacity) * 100;
                  const isFull = room.occupiedCount >= room.capacity;
                  
                  return (
                  <div key={room.id} className={`room-card ${isFull ? 'room-full' : ''}`}>
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
              )})}
            </div>
          </div>
        </main>
      </div>

      <FeedbackAlert isOpen={alert.show} message={alert.msg} type={alert.type} onClose={() => setAlert(p => ({...p, show: false}))} />
    </div>
  );
};

export default RoomAllocation;