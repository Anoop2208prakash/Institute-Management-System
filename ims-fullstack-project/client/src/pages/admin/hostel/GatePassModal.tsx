// client/src/components/hostel/GatePassModal.tsx
import React from 'react';
import { FaPrint, FaTimes, FaUserShield, FaMapMarkerAlt, FaIdCard, FaBarcode } from 'react-icons/fa';
import './GatePassModal.scss';

// Defined interface to ensure strict typing and data integrity
interface GatePassData {
    name: string;
    id: string;
    photo?: string;
    class?: string;
    hostel: string;
    room: string;
    issueDate: string;
}

interface GatePassProps {
    data: GatePassData | null; 
    onClose: () => void;
}

const GatePassModal: React.FC<GatePassProps> = ({ data, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    // Safety check to prevent rendering errors if data is not yet available
    if (!data) return null;

    return (
        <div className="gate-pass-overlay no-print" onClick={onClose}>
            <div className="gate-pass-container" onClick={e => e.stopPropagation()}>
                <div className="gate-pass-card printable">
                    <div className="card-accent-strip"></div>
                    <div className="card-watermark"><FaUserShield /></div>

                    <div className="pass-header">
                        <div className="logo-section">
                            <div className="logo-icon"><FaUserShield /></div>
                            <div className="header-text">
                                <h3>IMS UNIVERSITY</h3>
                                <span>Hostel Administration Office</span>
                            </div>
                        </div>
                        <div className="pass-type-badge">GATE PASS</div>
                        <button className="close-btn no-print" onClick={onClose} aria-label="Close"><FaTimes /></button>
                    </div>

                    <div className="pass-body">
                        <div className="student-profile-section">
                            {/* FIXED: Student Image / Avatar Logic to support Cloudinary URLs */}
                            <div className="photo-frame">
                                {data.photo ? (
                                    <img 
                                        src={data.photo} 
                                        alt={data.name} 
                                        onError={(e) => {
                                            // Fallback for broken Cloudinary links
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${data.name}&background=0D8ABC&color=fff`;
                                        }}
                                    />
                                ) : (
                                    <div className="photo-placeholder">{data.name.charAt(0)}</div>
                                )}
                            </div>
                            <div className="qr-code-area">
                                <FaBarcode className="barcode-icon" />
                                <small>{data.id}</small>
                            </div>
                        </div>

                        <div className="student-details-section">
                            <div className="detail-item">
                                <label>STUDENT NAME</label>
                                <p className="name-value">{data.name}</p>
                            </div>

                            <div className="details-grid">
                                <div className="detail-item">
                                    <label><FaIdCard /> ADMISSION ID</label>
                                    <p>{data.id}</p>
                                </div>
                                <div className="detail-item">
                                    <label><FaMapMarkerAlt /> RESIDENCE</label>
                                    <p>{data.hostel} | RM {data.room}</p>
                                </div>
                                <div className="detail-item">
                                    <label>ISSUE DATE</label>
                                    <p>{data.issueDate}</p>
                                </div>
                                <div className="detail-item">
                                    <label>VALID UNTIL</label>
                                    <p>End of Semester</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pass-footer">
                        <div className="signature-box">
                            <div className="sig-line"></div>
                            <span>Warden / Administrator</span>
                        </div>
                        <div className="footer-notice">
                            This pass is non-transferable and must be presented at the gate.
                        </div>
                    </div>
                </div>

                <div className="modal-actions no-print">
                    <button className="print-action-btn" onClick={handlePrint}>
                        <FaPrint /> Print Gate Pass
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GatePassModal;