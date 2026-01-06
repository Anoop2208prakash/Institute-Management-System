// client/src/pages/admin/hostel/HostelManagement.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
  FaHotel, FaBuilding, FaBed, 
  FaDoorOpen, FaPlus, FaTimes, FaChevronRight, FaSync 
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './HostelManagement.scss';
import FeedbackAlert from '../../../components/common/FeedbackAlert';

// 1. DATA INTERFACES
interface HostelStats {
  id: string;
  name: string;
  type: string;
  roomCount: number;
  totalCapacity: number;
  occupied: number;
  available: number;
  // Ensure rooms are part of the state for the allocation dropdown
  rooms: Array<{ 
    id: string; 
    roomNumber: string; 
    capacity: number; 
    _count: { allocations: number } 
  }>;
}

interface PendingStudent {
  studentId: string;
  name: string;
  className: string;
  admissionNo: string;
  gender: string;
}

const HostelManagement: React.FC = () => {
  // --- State Management ---
  const [stats, setStats] = useState<HostelStats[]>([]);
  const [pending, setPending] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });
  
  // Modals Toggle State
  const [isHostelModalOpen, setIsHostelModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  
  // Selection & Form State
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<PendingStudent | null>(null);
  const [targetRoomId, setTargetRoomId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [hostelData, setHostelData] = useState({ name: '', type: 'BOYS', capacity: '50' });
  const [roomData, setRoomData] = useState({ roomNumber: '', floor: '', capacity: '1' });

  const token = localStorage.getItem('token');

  // --- 2. DATA FETCHING ---
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      };
      
      const [statsRes, pendingRes] = await Promise.all([
        fetch('http://localhost:5000/api/hostel/stats', { headers }),
        fetch('http://localhost:5000/api/hostel/pending', { headers })
      ]);

      if (statsRes.ok && pendingRes.ok) {
        setStats(await statsRes.json());
        setPending(await pendingRes.json());
      } else {
        throw new Error("Failed to sync with hostel database");
      }
    } catch (error: any) {
      setAlert({ show: true, msg: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 3. ACTIONS ---
  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/hostel/create-hostel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(hostelData)
      });
      if (res.ok) {
        setAlert({ show: true, msg: 'Hostel block created!', type: 'success' });
        setIsHostelModalOpen(false);
        fetchData();
      }
    } catch (e) { setAlert({ show: true, msg: 'Failed to create hostel', type: 'error' }); }
    finally { setIsSubmitting(false); }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/hostel/rooms', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            ...roomData, 
            floor: parseInt(roomData.floor), 
            capacity: parseInt(roomData.capacity), 
            hostelId: selectedHostelId 
        })
      });
      if (res.ok) {
        setAlert({ show: true, msg: 'Room added!', type: 'success' });
        setIsRoomModalOpen(false);
        fetchData();
      }
    } catch (e) { setAlert({ show: true, msg: 'Failed to add room', type: 'error' }); }
    finally { setIsSubmitting(false); }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedStudent || !targetRoomId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/hostel/allocate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent.studentId, roomId: targetRoomId })
      });
      if (res.ok) {
        setAlert({ show: true, msg: 'Student allocated successfully!', type: 'success' });
        setIsAllocationModalOpen(false);
        setTargetRoomId('');
        fetchData();
      }
    } catch (e) { setAlert({ show: true, msg: 'Allocation failed', type: 'error' }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="modern-hostel-container">
      <header className="glass-header">
        <div className="title-block">
          <div className="icon-badge"><FaHotel /></div>
          <div>
            <h1>Residential Overview</h1>
            <p>Managing {stats.length} blocks • {pending.length} pending placements</p>
          </div>
        </div>
        <div className="header-actions">
           <button className="primary-action-btn" onClick={() => setIsHostelModalOpen(true)}>
             <FaPlus /> New Block
           </button>
           <button className="refresh-btn" onClick={fetchData}><FaSync /></button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="analytics-section">
          <h3 className="section-title">Institutional Capacity</h3>
          <div className="hostel-grid">
            {loading ? <Skeleton variant="rectangular" height={220} /> : stats.length === 0 ? (
               <div className="empty-blocks">Create your first hostel block to begin adding rooms.</div>
            ) : stats.map(hostel => {
              const occupancyRate = hostel.totalCapacity > 0 ? Math.round((hostel.occupied / hostel.totalCapacity) * 100) : 0;
              return (
                <div key={hostel.id} className="hostel-modern-card">
                  <div className="card-top">
                    <div className="block-name"><FaBuilding /> <span>{hostel.name}</span></div>
                    <button className="add-room-inline" onClick={() => { setSelectedHostelId(hostel.id); setIsRoomModalOpen(true); }}>
                       <FaPlus /> Add Room
                    </button>
                  </div>
                  <div className="occupancy-circle">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle" strokeDasharray={`${occupancyRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <text x="18" y="20.35" className="percentage">{occupancyRate}%</text>
                    </svg>
                  </div>
                  <div className="stats-row">
                    <div className="stat"><FaDoorOpen /> {hostel.roomCount} Rooms</div>
                    <div className="stat"><FaBed /> {hostel.available} Vacant</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="allocation-panel">
          <div className="panel-header">
            <h3>Pending Placement</h3>
            <span className="count-tag">{pending.length}</span>
          </div>
          <div className="student-queue">
            {pending.map(student => (
              <div key={student.studentId} className="queue-card">
                <div className="student-profile">
                   <div className="avatar-initial">{student.name.charAt(0)}</div>
                   <div className="details">
                      <h4>{student.name}</h4>
                      <p>{student.className} • {student.gender}</p>
                   </div>
                </div>
                <button 
                  className="action-arrow" 
                  onClick={() => { setSelectedStudent(student); setIsAllocationModalOpen(true); }}
                >
                  <FaChevronRight />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL: ALLOCATE STUDENT TO ROOM */}
      {isAllocationModalOpen && (
        <div className="modal-overlay">
          <div className="glass-modal">
            <div className="modal-header">
              <h3>Allocate Room</h3>
              <button onClick={() => setIsAllocationModalOpen(false)}><FaTimes /></button>
            </div>
            <p className="modal-intro">Assigning room for <strong>{selectedStudent?.name}</strong></p>
            <form onSubmit={handleAllocate}>
              <div className="form-group">
                <label>Select Building & Room</label>
                <select required value={targetRoomId} onChange={e => setTargetRoomId(e.target.value)}>
                  <option value="">Choose an available room...</option>
                  {stats.map(hostel => (
                    <optgroup key={hostel.id} label={`${hostel.name} (${hostel.type})`}>
                      {hostel.rooms?.filter(r => r._count.allocations < r.capacity).map(room => (
                        <option key={room.id} value={room.id}>
                          Room {room.roomNumber} - {room.capacity - room._count.allocations} bed(s) available
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <button type="submit" className="confirm-btn" disabled={isSubmitting || !targetRoomId}>
                {isSubmitting ? 'Processing...' : 'Complete Allocation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE HOSTEL BLOCK */}
      {isHostelModalOpen && (
        <div className="modal-overlay">
          <div className="glass-modal">
            <div className="modal-header"><h3>Create Block</h3><button onClick={() => setIsHostelModalOpen(false)}><FaTimes /></button></div>
            <form onSubmit={handleCreateHostel}>
              <div className="form-group"><label>Block Name</label><input type="text" required onChange={e => setHostelData({...hostelData, name: e.target.value})} /></div>
              <div className="form-group"><label>Type</label>
                <select onChange={e => setHostelData({...hostelData, type: e.target.value})}><option value="BOYS">Boys</option><option value="GIRLS">Girls</option></select>
              </div>
              <button type="submit" className="confirm-btn" disabled={isSubmitting}>Confirm Block</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROOM & FLOOR */}
      {isRoomModalOpen && (
        <div className="modal-overlay">
          <div className="glass-modal">
            <div className="modal-header"><h3>Add New Room</h3><button onClick={() => setIsRoomModalOpen(false)}><FaTimes /></button></div>
            <form onSubmit={handleAddRoom}>
              <div className="form-group"><label>Room Number</label><input type="text" required onChange={e => setRoomData({...roomData, roomNumber: e.target.value})} /></div>
              <div className="form-row-dual">
                <div className="form-group"><label>Floor</label><input type="number" required onChange={e => setRoomData({...roomData, floor: e.target.value})} /></div>
                <div className="form-group"><label>Beds</label><input type="number" required onChange={e => setRoomData({...roomData, capacity: e.target.value})} /></div>
              </div>
              <button type="submit" className="confirm-btn" disabled={isSubmitting}>Confirm Room</button>
            </form>
          </div>
        </div>
      )}

      <FeedbackAlert isOpen={alert.show} message={alert.msg} type={alert.type} onClose={() => setAlert(p => ({...p, show: false}))} />
    </div>
  );
};

export default HostelManagement;