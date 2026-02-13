// client/src/pages/student/hostel/ApplyGatePass.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FaTicketAlt, FaHistory, FaPrint, FaTimes,
  FaCheckCircle, FaHourglassHalf, FaTimesCircle
} from 'react-icons/fa';
import './ApplyGatePass.scss';
import CustomDateTimePicker from '../../components/common/CustomDateTimePicker';
import FeedbackAlert from '../../components/common/FeedbackAlert';

interface GatePassRecord {
  id: string;
  reason: string;
  outTime: string;
  inTime: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: {
    fullName: string; 
  };
}

const ApplyGatePass: React.FC = () => {
  const [formData, setFormData] = useState({
    reason: '', outTime: '', inTime: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [history, setHistory] = useState<GatePassRecord[]>([]);
  const [selectedPass, setSelectedPass] = useState<GatePassRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });
  const [studentInfo, setStudentInfo] = useState<any>(null);

  const token = localStorage.getItem('token');
  const printRef = useRef<HTMLDivElement>(null);

  const stringToDate = (val: string) => val ? new Date(val) : null;
  const stringToTime = (val: string) => {
    if (!val) return null;
    const [hours, minutes] = val.split(':');
    const d = new Date();
    d.setHours(parseInt(hours), parseInt(minutes), 0);
    return d;
  };

  const fetchData = useCallback(async () => {
    try {
      const histRes = await fetch('http://localhost:5000/api/hostel/gatepass/my-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (histRes.ok) setHistory(await histRes.json());

      const profileRes = await fetch('http://localhost:5000/api/profile/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileRes.ok) {
        const data = await profileRes.json();
        setStudentInfo(data); 
      }
    } catch { console.error("Failed to load data"); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/hostel/gatepass/apply', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setAlert({ show: true, msg: 'Gate pass applied successfully!', type: 'success' });
        setFormData({ reason: '', outTime: '', inTime: '', date: new Date().toISOString().split('T')[0] });
        fetchData();
      }
    } catch { setAlert({ show: true, msg: 'Server error', type: 'error' }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="gatepass-application-container">
      <header className="page-header no-print">
        <div className="title-section">
          <div className="icon-badge"><FaTicketAlt /></div>
          <div>
            <h1>Out-Pass Application</h1>
            <p>Request permission to leave campus premises</p>
          </div>
        </div>
      </header>

      <div className="application-grid no-print">
        <section className="form-card">
          <h3>Request Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Reason for Leaving</label>
              <textarea required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
            </div>
            <div className="form-row">
              <CustomDateTimePicker 
                label="Date of Departure" 
                type="date" 
                value={stringToDate(formData.date)} 
                onChange={(val) => val && setFormData({ ...formData, date: val.toISOString().split('T')[0] })} 
                required 
              />
            </div>
            <div className="form-row dual">
              <CustomDateTimePicker 
                label="Out Time" 
                type="time" 
                value={stringToTime(formData.outTime)}
                onChange={(val) => {
                  if (val) {
                    const timeStr = `${val.getHours().toString().padStart(2, '0')}:${val.getMinutes().toString().padStart(2, '0')}`;
                    setFormData({ ...formData, outTime: timeStr });
                  }
                }} 
                required 
              />
              <CustomDateTimePicker 
                label="Expected In Time" 
                type="time" 
                value={stringToTime(formData.inTime)}
                onChange={(val) => {
                  if (val) {
                    const timeStr = `${val.getHours().toString().padStart(2, '0')}:${val.getMinutes().toString().padStart(2, '0')}`;
                    setFormData({ ...formData, inTime: timeStr });
                  }
                }} 
                required 
              />
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>Submit Application</button>
          </form>
        </section>

        <section className="history-card">
          <h3><FaHistory /> Recent Passes</h3>
          <div className="history-list">
            {history.length === 0 ? <p className="empty">No recent records.</p> : history.map((pass: any) => (
              <div key={pass.id} className={`history-item ${pass.status.toLowerCase()}`} onClick={() => setSelectedPass(pass)}>
                <div className="pass-meta">
                  <strong>{new Date(pass.date).toLocaleDateString('en-GB')}</strong>
                  <span className="time">{pass.outTime} - {pass.inTime}</span>
                </div>
                <div className="status-indicator">
                    {pass.status === 'PENDING' && <FaHourglassHalf />}
                    {pass.status === 'APPROVED' && <FaCheckCircle />}
                    {pass.status === 'REJECTED' && <FaTimesCircle />}
                    {pass.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedPass && (
        <div className="gatepass-modal-overlay">
          <div className="ticket-wrapper">
            <button className="modal-close-trigger no-print" onClick={() => setSelectedPass(null)}>
              <FaTimes />
            </button>

            <div className="modern-ticket" ref={printRef}>
              <div className="ticket-header">
                <div className="header-content">
                  <div className="logo-group">
                    <FaTicketAlt className="ticket-icon" />
                    <div>
                      <h2>STUDENT OUT-PASS</h2>
                      <span className="serial">Ref: {selectedPass.id.split('-')[0].toUpperCase()}</span>
                    </div>
                  </div>
                  <div className={`status-badge ${selectedPass.status.toLowerCase()}`}>
                    {selectedPass.status}
                  </div>
                </div>
                <div className="notch-left"></div>
                <div className="notch-right"></div>
              </div>

              <div className="ticket-body">
                <div className="profile-row">
                  <div className="student-avatar">
                    {/* FIXED: Removed localhost prefix to support absolute Cloudinary URLs */}
                    {studentInfo?.avatar ? (
                      <img 
                        src={studentInfo.avatar} 
                        alt="Avatar" 
                        onError={(e) => {
                          // Fallback if Cloudinary link is broken
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${studentInfo?.name || 'Student'}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="avatar-placeholder">{studentInfo?.name?.charAt(0) || 'S'}</div>
                    )}
                  </div>
                  <div className="student-meta">
                    <h3>{studentInfo?.name || 'Student Name'}</h3>
                    <p>ID: {studentInfo?.sID || '00000'} • {studentInfo?.details?.className || 'Program'}</p>
                  </div>
                </div>

                <div className="timing-grid">
                  <div className="time-block">
                    <label>Departure Date</label>
                    <p>{new Date(selectedPass.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="time-block">
                    <label>Out Time</label>
                    <p className="highlight">{selectedPass.outTime}</p>
                  </div>
                  <div className="time-block">
                    <label>Expected In</label>
                    <p className="highlight">{selectedPass.inTime}</p>
                  </div>
                </div>

                <div className="reason-container">
                  <label>Purpose of Visit</label>
                  <p>{selectedPass.reason}</p>
                </div>

                <div className="ticket-footer">
                  <div className="security-note">
                    <p>This is a system-generated document. Unauthorized alteration is a punishable offense.</p>
                  </div>
                  <div className="auth-row">
                    <div className="sig-box">
                      <div className="auto-signature">
                        {selectedPass.status === 'APPROVED' ? selectedPass.approvedBy?.fullName : 'Warden'}
                      </div>
                      <div className="line"></div>
                      <span>Warden Signature</span>
                    </div>
                    <div className="qr-section">
                      <div className="qr-container">
                        <QRCodeSVG 
                          value={`http://localhost:5000/verify/${selectedPass.id}`} 
                          size={60}
                          level="H" 
                        />
                      </div>
                      <span>VERIFY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-actions no-print">
              <button className="print-btn" onClick={() => window.print()}>
                <FaPrint /> Print Official Pass
              </button>
            </div>
          </div>
        </div>
      )}

      <FeedbackAlert isOpen={alert.show} message={alert.msg} type={alert.type} onClose={() => setAlert({...alert, show: false})} />
    </div>
  );
};

export default ApplyGatePass;