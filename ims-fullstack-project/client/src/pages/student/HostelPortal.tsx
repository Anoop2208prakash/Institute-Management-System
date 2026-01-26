// client/src/pages/student/hostel/HostelPortal.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    FaHotel, FaDoorOpen, FaUserFriends, FaClipboardList,
    FaExclamationCircle, FaMapMarkerAlt
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import './HostelPortal.scss';

interface Roommate {
    id: string;
    name: string;
    className: string;
    avatar?: string; // This will now hold the full Cloudinary URL
}

interface StudentAllocation {
    hostelName: string;
    roomNumber: string;
    floor: number;
    roomType: string;
    capacity: number;
    occupants: number;
    roommates: Roommate[];
}

const HostelPortal: React.FC = () => {
    const [allocation, setAllocation] = useState<StudentAllocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    const fetchAllocation = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/hostel/my-allocation', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                setError("Session expired. Please login again.");
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setAllocation(data);
            } else {
                setError("No active room allocation found.");
            }
        } catch (err) {
            setError("Failed to connect to the residential server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchAllocation(); }, [fetchAllocation]);

    if (loading) return (
        <div className="hostel-portal-container">
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '1.5rem', mb: 3 }} />
            <div className="grid-skeleton">
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '1.5rem' }} />
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '1.5rem' }} />
            </div>
        </div>
    );

    return (
        <div className="hostel-portal-container">
            <header className="portal-header">
                <div className="title-section">
                    <div className="icon-box"><FaHotel /></div>
                    <div>
                        <h1>My Residential Space</h1>
                        <p>Academic Year 2024-25 • Current Status: Active</p>
                    </div>
                </div>
            </header>

            {error || !allocation ? (
                <div className="no-allocation-card">
                    <FaExclamationCircle className="warning-icon" />
                    <h2>{error ? "Notice" : "No Allocation Found"}</h2>
                    <p>{error || "You haven't been assigned a room yet. Please contact the Warden's office for residential placement."}</p>
                </div>
            ) : (
                <div className="portal-grid">
                    {/* ROOM INFO CARD */}
                    <div className="info-card room-details glass-card">
                        <h3><FaDoorOpen /> Room Information</h3>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Hostel Block</label>
                                <span>{allocation.hostelName}</span>
                            </div>
                            <div className="detail-item">
                                <label>Room Number</label>
                                <span>{allocation.roomNumber}</span>
                            </div>
                            <div className="detail-item">
                                <label>Floor Level</label>
                                <span>{allocation.floor}</span>
                            </div>
                            <div className="detail-item">
                                <label>Occupancy</label>
                                <span>{allocation.occupants} / {allocation.capacity} Beds</span>
                            </div>
                        </div>
                        <div className="location-tag">
                            <FaMapMarkerAlt /> Global Institute Residential Wing
                        </div>
                    </div>

                    {/* ROOMMATES CARD */}
                    <div className="info-card roommate-section glass-card">
                        <h3><FaUserFriends /> My Roommates</h3>
                        <div className="roommate-list">
                            {allocation.roommates.length === 0 ? (
                                <p className="empty-msg">You are currently the sole occupant.</p>
                            ) : (
                                allocation.roommates.map(buddy => (
                                    <div key={buddy.id} className="buddy-row">
                                        <div className="buddy-avatar">
                                            {/* FIXED: Using direct absolute Cloudinary URL for roommate avatars */}
                                            {buddy.avatar ? (
                                                <img 
                                                    src={buddy.avatar} 
                                                    alt={buddy.name} 
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${buddy.name}&background=random`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {buddy.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="buddy-info">
                                            <strong>{buddy.name}</strong>
                                            <span>{buddy.className}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RULES & NOTICES */}
                    <div className="info-card rules-card full-width glass-card">
                        <h3><FaClipboardList /> Residential Rules & Guidelines</h3>
                        <ul>
                            <li>Check-in time: Before 9:00 PM daily.</li>
                            <li>Quiet hours: 10:00 PM to 6:00 AM.</li>
                            <li>Visitors are allowed in the common room only between 4:00 PM - 6:00 PM.</li>
                            <li>Report any maintenance issues via the Support portal immediately.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HostelPortal;