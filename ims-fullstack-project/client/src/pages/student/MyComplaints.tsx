// client/src/pages/student/hostel/MyComplaints.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaExclamationTriangle, FaPlus, FaClock, FaCheckCircle, FaTools, FaTimes } from 'react-icons/fa';
import './MyComplaints.scss';
import FeedbackAlert from '../../components/common/FeedbackAlert';

interface Complaint {
    id: string;
    subject: string;
    category: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: string;
}

const MyComplaints: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ subject: '', category: 'Maintenance', description: '' });
    const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

    const token = localStorage.getItem('token');

    const fetchComplaints = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/hostel/my-complaints', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setComplaints(await res.json());
        } finally { setLoading(false); }
    }, [token]);

    useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/hostel/submit-complaint', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setAlert({ show: true, msg: 'Complaint filed successfully', type: 'success' });
                setIsModalOpen(false);
                setFormData({ subject: '', category: 'Maintenance', description: '' });
                fetchComplaints();
            }
        } finally { setIsSubmitting(false); }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'RESOLVED') return <FaCheckCircle className="status-resolved" />;
        if (status === 'IN_PROGRESS') return <FaTools className="status-progress" />;
        return <FaClock className="status-pending" />;
    };

    return (
        <div className="complaints-container">
            <header className="complaints-header">
                <div>
                    <h1>Maintenance & Grievances</h1>
                    <p>Report issues with your room or hostel facilities</p>
                </div>
                <button className="add-complaint-btn" onClick={() => setIsModalOpen(true)}>
                    <FaPlus /> File New Complaint
                </button>
            </header>

            <div className="complaints-list">
                {loading ? <p>Loading records...</p> : complaints.length === 0 ? (
                    <div className="empty-state glass-card">
                        <FaExclamationTriangle />
                        <p>No complaints filed yet.</p>
                    </div>
                ) : (
                    complaints.map(item => (
                        <div key={item.id} className="complaint-card glass-card">
                            <div className="card-header">
                                <span className={`category-tag ${item.category.toLowerCase()}`}>{item.category}</span>
                                <div className="status-indicator">
                                    {getStatusIcon(item.status)}
                                    <span>{item.status.replace('_', ' ')}</span>
                                </div>
                            </div>
                            <h3>{item.subject}</h3>
                            <p>{item.description}</p>
                            <div className="card-footer">
                                <span>Filed on: {new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="glass-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>File a Complaint</h3>
                            <button onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Issue Subject</label>
                                <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g., Fan not working" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Cleanliness">Cleanliness</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Provide details about the issue..." />
                            </div>
                            <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <FeedbackAlert isOpen={alert.show} message={alert.msg} type={alert.type} onClose={() => setAlert(p => ({ ...p, show: false }))} />
        </div>
    );
};

export default MyComplaints;