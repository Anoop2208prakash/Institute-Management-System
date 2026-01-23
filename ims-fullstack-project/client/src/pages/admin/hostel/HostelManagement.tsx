// client/src/pages/admin/hostel/HostelManagement.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FaHotel, FaBuilding, FaBed, FaSearch, FaExchangeAlt,
  FaDoorOpen, FaPlus, FaTimes, FaChevronRight, FaSync, FaUserFriends, FaTrash
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './HostelManagement.scss';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import CustomSelect from '../../../components/common/CustomSelect';

// --- DATA INTERFACES ---
interface HostelStats {
  id: string;
  name: string;
  type: string; // 'BOYS' or 'GIRLS'
  roomCount: number;
  totalCapacity: number;
  occupied: number;
  available: number;
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
  gender: string; // 'MALE' or 'FEMALE'
}

interface Resident {
  id: string; // This is the Student ID for transfer purposes
  name: string;
  admissionNo: string;
  className: string;
  roomNumber: string;
  floor: number;
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
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [isManageRoomsModalOpen, setIsManageRoomsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Selection & Form State
  const [selectedHostel, setSelectedHostel] = useState<HostelStats | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [targetRoomId, setTargetRoomId] = useState('');
  const [roomSearchTerm, setRoomSearchTerm] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hostelData, setHostelData] = useState({ name: '', type: 'BOYS', capacity: '50' });
  const [roomData, setRoomData] = useState({ roomNumber: '', floor: '', capacity: '1' });

  const token = localStorage.getItem('token');

  // --- Data Fetching ---
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
      }
    } catch (error: any) {
      setAlert({ show: true, msg: "Failed to connect to server", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Logic: Gender-Specific Room Options ---
  const availableRoomOptions = useMemo(() => {
    if (!selectedStudent) return [];
    
    const options: { value: string; label: string }[] = [];
    const targetType = selectedStudent.gender === 'MALE' ? 'BOYS' : 'GIRLS';

    stats.forEach(hostel => {
      if (hostel.type === targetType) {
        hostel.rooms?.filter(r => r._count.allocations < r.capacity).forEach(room => {
          options.push({
            value: room.id,
            label: `${hostel.name} - Room ${room.roomNumber} (${room.capacity - room._count.allocations} vacant)`
          });
        });
      }
    });
    return options;
  }, [stats, selectedStudent]);

  const genderOptions = [
    { value: 'BOYS', label: 'Boys Hostel' },
    { value: 'GIRLS', label: 'Girls Hostel' }
  ];

  // --- Handlers ---
  const handleViewResidents = async (hostel: HostelStats) => {
    setSelectedHostel(hostel);
    try {
      const res = await fetch(`http://localhost:5000/api/hostel/${hostel.id}/residents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setResidents(await res.json());
        setIsResidentModalOpen(true);
      }
    } catch (e) {
      setAlert({ show: true, msg: 'Error loading residents', type: 'error' });
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !targetRoomId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/hostel/transfer', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent.studentId, newRoomId: targetRoomId })
      });
      if (res.ok) {
        setAlert({ show: true, msg: 'Resident transferred successfully!', type: 'success' });
        setIsTransferModalOpen(false);
        setIsResidentModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        setAlert({ show: true, msg: errorData.message || 'Transfer failed', type: 'error' });
      }
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm("Are you sure? This will remove the room from the database.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/hostel/room/${roomId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ show: true, msg: 'Room removed!', type: 'success' });
        setIsManageRoomsModalOpen(false);
        fetchData();
      } else {
        setAlert({ show: true, msg: data.message, type: 'error' });
      }
    } catch (e) {
      setAlert({ show: true, msg: 'Delete request failed', type: 'error' });
    }
  };

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
    } finally { setIsSubmitting(false); }
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
          hostelId: selectedHostel?.id
        })
      });
      if (res.ok) {
        setAlert({ show: true, msg: 'Room added!', type: 'success' });
        setIsRoomModalOpen(false);
        fetchData();
      }
    } finally { setIsSubmitting(false); }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !targetRoomId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/hostel/allocate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent.studentId, roomId: targetRoomId })
      });
      if (res.ok) {
        setAlert({ show: true, msg: 'Allocation successful!', type: 'success' });
        setIsAllocationModalOpen(false);
        fetchData();
      }
    } finally { setIsSubmitting(false); }
  };

  const filteredRooms = selectedHostel?.rooms.filter(r =>
    r.roomNumber.toLowerCase().includes(roomSearchTerm.toLowerCase())
  ) || [];

  return (
    <div className="modern-hostel-container">
      <header className="glass-header">
        <div className="title-block">
          <div className="icon-badge"><FaHotel /></div>
          <div>
            <h1>Hostel Management</h1>
            <p>{stats.length} active blocks • {pending.length} pending students</p>
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
        {/* LEFT: HOSTEL CARDS */}
        <section className="analytics-section">
          <div className="hostel-grid">
            {loading ? <Skeleton variant="rectangular" height={250} /> : stats.map(hostel => {
              const occupancyRate = hostel.totalCapacity > 0 ? Math.round((hostel.occupied / hostel.totalCapacity) * 100) : 0;
              return (
                <div key={hostel.id} className="hostel-modern-card">
                  <div className="card-top">
                    <div className="block-name"><FaBuilding /> <span>{hostel.name}</span></div>
                    <div className="room-action-group">
                      <button className="manage-rooms-inline" onClick={() => { setSelectedHostel(hostel); setIsManageRoomsModalOpen(true); }}>
                        <FaTrash /> Manage
                      </button>
                      <button className="add-room-inline" onClick={() => { setSelectedHostel(hostel); setIsRoomModalOpen(true); }}>
                        <FaPlus /> Add
                      </button>
                    </div>
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

                  <div className="card-footer">
                    <button className="view-residents-btn" onClick={() => handleViewResidents(hostel)}>
                      <FaUserFriends /> View Students
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT: PENDING PLACEMENT */}
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
                <button className="action-arrow" onClick={() => { setSelectedStudent(student); setIsAllocationModalOpen(true); }}>
                  <FaChevronRight />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL: MANAGE ROOMS */}
      {isManageRoomsModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsManageRoomsModalOpen(false); setRoomSearchTerm(''); }}>
          <div className="glass-modal manage-rooms-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaDoorOpen /> {selectedHostel?.name} Rooms</h3>
              <button onClick={() => { setIsManageRoomsModalOpen(false); setRoomSearchTerm(''); }}><FaTimes /></button>
            </div>
            <div className="search-bar-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search room number..."
                value={roomSearchTerm}
                onChange={(e) => setRoomSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="room-list-container">
              {filteredRooms.length === 0 ? (
                <div className="empty-state">No rooms found.</div>
              ) : filteredRooms.map(room => (
                <div key={room.id} className="room-item-row">
                  <div className="info">
                    <strong>Room {room.roomNumber}</strong>
                    <span>{room.capacity} Beds • {room._count.allocations} Occupied</span>
                  </div>
                  <button onClick={() => handleDeleteRoom(room.id)} className="delete-btn"><FaTrash /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESIDENTS LIST WITH TRANSFER OPTION */}
      {isResidentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsResidentModalOpen(false)}>
          <div className="glass-modal resident-list-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Residents: {selectedHostel?.name}</h3>
              <button onClick={() => setIsResidentModalOpen(false)}><FaTimes /></button>
            </div>
            <div className="resident-table-wrapper">
              <table className="modern-table">
                <thead><tr><th>Student</th><th>Room</th><th>ID</th><th>Actions</th></tr></thead>
                <tbody>
                  {residents.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.name}</strong><br/><small>{r.className}</small></td>
                      <td>{r.roomNumber}</td>
                      <td><code>{r.admissionNo}</code></td>
                      <td>
                        <button 
                           className="transfer-inline-btn"
                           onClick={() => {
                             setSelectedStudent({ studentId: r.id, name: r.name, gender: r.gender });
                             setIsTransferModalOpen(true);
                           }}
                        >
                          <FaExchangeAlt /> Transfer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER ROOM */}
      {isTransferModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsTransferModalOpen(false); setTargetRoomId(''); }}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaExchangeAlt /> Room Transfer</h3>
              <button onClick={() => setIsTransferModalOpen(false)}><FaTimes /></button>
            </div>
            <p>Transferring <strong>{selectedStudent?.name}</strong></p>
            <form onSubmit={handleTransfer}>
              <CustomSelect 
                label={`Available ${selectedStudent?.gender === 'MALE' ? 'Boys' : 'Girls'} Rooms`}
                placeholder="Choose new room..."
                value={targetRoomId}
                options={availableRoomOptions}
                onChange={(e) => setTargetRoomId(e.target.value as string)}
                required={true}
              />
              <button type="submit" className="confirm-btn" disabled={isSubmitting || !targetRoomId}>
                {isSubmitting ? 'Transferring...' : 'Complete Transfer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE HOSTEL */}
      {isHostelModalOpen && (
        <div className="modal-overlay" onClick={() => setIsHostelModalOpen(false)}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>New Hostel Block</h3><button onClick={() => setIsHostelModalOpen(false)}><FaTimes /></button></div>
            <form onSubmit={handleCreateHostel}>
              <div className="form-group"><label>Block Name</label><input type="text" required onChange={e => setHostelData({ ...hostelData, name: e.target.value })} /></div>
              <CustomSelect 
                label="Gender Type"
                value={hostelData.type}
                options={genderOptions}
                onChange={(e) => setHostelData({ ...hostelData, type: e.target.value as string })}
              />
              <button type="submit" className="confirm-btn" disabled={isSubmitting}>Create Block</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROOM */}
      {isRoomModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRoomModalOpen(false)}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Room to {selectedHostel?.name}</h3><button onClick={() => setIsRoomModalOpen(false)}><FaTimes /></button></div>
            <form onSubmit={handleAddRoom}>
              <div className="form-group"><label>Room Number / Name</label><input type="text" required onChange={e => setRoomData({ ...roomData, roomNumber: e.target.value })} /></div>
              <div className="form-row-dual" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}><label>Floor</label><input type="number" required onChange={e => setRoomData({ ...roomData, floor: e.target.value })} /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Total Beds</label><input type="number" required onChange={e => setRoomData({ ...roomData, capacity: e.target.value })} /></div>
              </div>
              <button type="submit" className="confirm-btn" disabled={isSubmitting}>Add Room</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ALLOCATION */}
      {isAllocationModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsAllocationModalOpen(false); setTargetRoomId(''); }}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Allocate Room</h3><button onClick={() => setIsAllocationModalOpen(false)}><FaTimes /></button></div>
            <p>Assigning <strong>{selectedStudent?.name}</strong> ({selectedStudent?.gender === 'MALE' ? 'Male' : 'Female'})</p>
            <form onSubmit={handleAllocate}>
              <CustomSelect 
                label={`Select Available ${selectedStudent?.gender === 'MALE' ? 'Boys' : 'Girls'} Room`}
                placeholder={availableRoomOptions.length > 0 ? "Choose an empty bed..." : "No matching rooms found"}
                value={targetRoomId}
                options={availableRoomOptions}
                onChange={(e) => setTargetRoomId(e.target.value as string)}
                required={true}
              />
              <button type="submit" className="confirm-btn" disabled={isSubmitting || !targetRoomId || availableRoomOptions.length === 0}>
                Confirm Placement
              </button>
            </form>
          </div>
        </div>
      )}

      <FeedbackAlert isOpen={alert.show} message={alert.msg} type={alert.type} onClose={() => setAlert(p => ({ ...p, show: false }))} />
    </div>
  );
};

export default HostelManagement;