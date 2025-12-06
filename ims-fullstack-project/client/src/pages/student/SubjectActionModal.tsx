// client/src/components/student/SubjectActionModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaChartPie, FaTimesCircle, FaExclamationCircle, FaClipboardList, FaPenNib, FaArrowLeft } from 'react-icons/fa';
import '../admin/CreateRoleModal.scss'; // Reuse modal styles
import '../../pages/student/MyAttendance.scss'; // Reuse attendance styles
import LinearLoader from '../../components/common/LinearLoader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subject: { id: string; name: string } | null;
}

// 1. Define Strict Interface
interface AttendanceRecord {
    id: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

interface AttendanceData {
    stats: { total: number; present: number; percentage: string };
    history: AttendanceRecord[]; // Fixed type
}

export const SubjectActionModal: React.FC<Props> = ({ isOpen, onClose, subject }) => {
  const [view, setView] = useState<'MENU' | 'ATTENDANCE' | 'TEST'>('MENU');
  
  // Attendance State
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset view when opening
  useEffect(() => {
    if (isOpen) setView('MENU');
  }, [isOpen]);

  // Fetch Attendance when switching to that view
  useEffect(() => {
    if (view === 'ATTENDANCE' && subject) {
        const fetchSubjectAttendance = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`http://localhost:5000/api/students/my-attendance?subjectId=${subject.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setData(await res.json());
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchSubjectAttendance();
    }
  }, [view, subject]);

  if (!isOpen || !subject) return null;

  const getStatusIcon = (status: string) => {
      if (status === 'PRESENT') return <FaCheckCircle style={{color:'#1a7f37'}} />;
      if (status === 'ABSENT') return <FaTimesCircle style={{color:'#cf222e'}} />;
      return <FaExclamationCircle style={{color:'#d29922'}} />;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{maxWidth: '600px', minHeight: '400px'}}>
        <div className="modal-header">
          <h3>
             {view !== 'MENU' && (
                 <button onClick={() => setView('MENU')} style={{background:'none', border:'none', cursor:'pointer', marginRight:'10px', color:'var(--primary-color)'}}>
                     <FaArrowLeft />
                 </button>
             )}
             {subject.name}
          </h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body" style={{padding: '1.5rem', maxHeight:'70vh', overflowY:'auto'}}>
            
            {/* --- VIEW 1: MAIN MENU --- */}
            {view === 'MENU' && (
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', height:'100%'}}>
                    <button 
                        onClick={() => setView('ATTENDANCE')}
                        style={{
                            background: 'var(--bg-secondary-color)', border: '1px solid var(--border-light-color)',
                            borderRadius: '12px', padding: '2rem', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                            transition: 'all 0.2s', boxShadow: 'var(--box-shadow-1)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light-color)'}
                    >
                        <div style={{fontSize:'2.5rem', color:'var(--primary-color)'}}><FaClipboardList /></div>
                        <span style={{fontSize:'1.1rem', fontWeight:'600', color:'var(--heading-color)'}}>My Attendance</span>
                    </button>

                    <button 
                        onClick={() => setView('TEST')}
                        style={{
                            background: 'var(--bg-secondary-color)', border: '1px solid var(--border-light-color)',
                            borderRadius: '12px', padding: '2rem', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                            transition: 'all 0.2s', boxShadow: 'var(--box-shadow-1)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#d29922'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light-color)'}
                    >
                        <div style={{fontSize:'2.5rem', color:'#d29922'}}><FaPenNib /></div>
                        <span style={{fontSize:'1.1rem', fontWeight:'600', color:'var(--heading-color)'}}>Online Test</span>
                    </button>
                </div>
            )}

            {/* --- VIEW 2: ATTENDANCE --- */}
            {view === 'ATTENDANCE' && (
                <>
                    {loading ? <LinearLoader /> : data ? (
                        <div className="student-page">
                            {/* Mini Stats */}
                            <div className="stats-row" style={{gridTemplateColumns: '1fr 1fr'}}>
                                <div className="stat-card" style={{padding:'1rem'}}>
                                    <div className="icon blue" style={{width:'40px', height:'40px', fontSize:'1.2rem'}}><FaChartPie /></div>
                                    <div>
                                        <h3 style={{fontSize:'1.4rem'}}>{data.stats.percentage}%</h3>
                                        <p style={{fontSize:'0.8rem'}}>Attendance</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{padding:'1rem'}}>
                                    <div className="icon green" style={{width:'40px', height:'40px', fontSize:'1.2rem'}}><FaCheckCircle /></div>
                                    <div>
                                        <h3 style={{fontSize:'1.4rem'}}>{data.stats.present}/{data.stats.total}</h3>
                                        <p style={{fontSize:'0.8rem'}}>Classes Attended</p>
                                    </div>
                                </div>
                            </div>

                            {/* History List */}
                            <div className="list-container" style={{marginTop: '1.5rem', boxShadow:'none', border:'1px solid var(--border-light-color)'}}>
                                <h4 style={{margin:'0 0 1rem 0', fontSize:'1rem'}}>History</h4>
                                {/* 2. Use typed variable 'record' */}
                                {data.history.length > 0 ? data.history.map((record) => (
                                    <div key={record.id} className="list-item">
                                        <div className="item-left">
                                            {getStatusIcon(record.status)}
                                            <div className="details">
                                                <span className="date">{new Date(record.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span>
                                    </div>
                                )) : (
                                    <div className="empty-state">No attendance records.</div>
                                )}
                            </div>
                        </div>
                    ) : <p style={{textAlign:'center'}}>No data available</p>}
                </>
            )}

            {/* --- VIEW 3: TEST (Placeholder) --- */}
            {view === 'TEST' && (
                <div style={{textAlign:'center', padding:'3rem 1rem'}}>
                    <div style={{fontSize:'3rem', color:'var(--text-muted-color)', marginBottom:'1rem'}}><FaPenNib /></div>
                    <h3>No Active Tests</h3>
                    <p style={{color:'var(--text-muted-color)'}}>There are no online exams scheduled for {subject.name} at this moment.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};