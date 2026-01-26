// client/src/features/hostel/GatePassHistory.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
    FaHistory, FaSearch, FaUserClock, FaFilePdf, FaArrowLeft, FaUserCircle 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './GatePassHistory.scss';

interface HistoryRecord {
    id: string;
    reason: string;
    outTime: string;
    inTime: string;
    date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    studentName: string; // Flattened from backend
    admissionNo: string;
    className: string;
    studentAvatar: string | null; // FIXED: Direct Cloudinary URL
    admin?: {
        fullName: string; 
    };
}

const GatePassHistory: React.FC = () => {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/hostel/gatepass/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to load pass history:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const handleExport = () => {
        window.print(); // Triggers the PDF layout defined in SCSS
    };

    const filteredHistory = history.filter(item => 
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.admissionNo.includes(searchTerm)
    );

    return (
        <div className="history-page-container">
            {/* Header: Hidden during Print */}
            <header className="page-header no-print">
                <div className="title-area">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FaArrowLeft />
                    </button>
                    <div className="icon-box"><FaHistory /></div>
                    <div>
                        <h1>Gate Pass Audit Log</h1>
                        <p>Total processed records: {history.length}</p>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="search-bar">
                        <FaSearch />
                        <input 
                            type="text" 
                            placeholder="Search student or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="export-btn" onClick={handleExport}>
                        <FaFilePdf /> Export Report
                    </button>
                </div>
            </header>

            {/* Print-Only Title */}
            <div className="print-header only-print">
                <h1>Hostel Gate Pass Audit Report</h1>
                <p>Generated on: {new Date().toLocaleString()}</p>
            </div>

            <div className="history-table-wrapper card-shadow">
                {loading ? (
                    <div className="status-text">Loading records...</div>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Student Details</th>
                                <th>Departure Date</th>
                                <th>Timings (Out/In)</th>
                                <th>Status</th>
                                <th>Authorized By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length === 0 ? (
                                <tr><td colSpan={5} className="empty">No records found.</td></tr>
                            ) : filteredHistory.map(record => (
                                <tr key={record.id}>
                                    <td>
                                        <div className="student-cell">
                                            {/* FIXED: Rendering Cloudinary Avatar with local fallback */}
                                            {record.studentAvatar ? (
                                                <img 
                                                    src={record.studentAvatar} 
                                                    alt="Student" 
                                                    className="history-avatar"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement?.querySelector('.placeholder')?.setAttribute('style', 'display: flex');
                                                    }}
                                                />
                                            ) : (
                                                <div className="avatar-placeholder placeholder"><FaUserCircle /></div>
                                            )}
                                            <div className="student-info">
                                                <strong>{record.studentName}</strong>
                                                <span>{record.admissionNo} • {record.className}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{new Date(record.date).toLocaleDateString('en-GB')}</td>
                                    <td>
                                        <div className="time-info">
                                            <FaUserClock /> {record.outTime} - {record.inTime}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${record.status.toLowerCase()}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="warden-name">
                                            {record.admin?.fullName || 'System'}
                                        </div>
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

export default GatePassHistory;