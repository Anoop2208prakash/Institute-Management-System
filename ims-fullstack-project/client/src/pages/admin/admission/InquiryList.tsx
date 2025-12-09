// client/src/pages/admin/admission/InquiryList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaEnvelopeOpenText, FaSearch, FaPhone, FaTrash, FaCheckDouble, FaEnvelope, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './InquiryList.scss';

interface Inquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  course: string | null;
  message: string;
  status: string;
  date: string;
}

const InquiryList: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, name: string}>({ show: false, id: '', name: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/inquiries', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setInquiries(await res.json());
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleMarkContacted = async (id: string) => {
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/inquiries/${id}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ status: 'CONTACTED' })
          });
          if(res.ok) {
              setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'CONTACTED' } : i));
              showAlert('success', 'Marked as Contacted');
          }
      } catch(e) { console.error(e); }
  };

  const handleDelete = async () => {
      setIsDeleting(true);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/inquiries/${deleteModal.id}`, { 
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if(res.ok) {
              setInquiries(prev => prev.filter(i => i.id !== deleteModal.id));
              setDeleteModal({ show: false, id: '', name: '' });
              showAlert('success', 'Inquiry deleted');
          }
      } catch(e) { showAlert('error', 'Network error'); }
      finally { setIsDeleting(false); }
  };

  const filteredList = inquiries.filter(i => 
    i.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inquiry-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaEnvelopeOpenText /> Admission Inquiries</h2>
            <p>Manage new student leads and questions.</p>
        </div>
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search inquiries..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="count-badge">Total: {filteredList.length}</div>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="inquiry-grid">
        {loading ? (
             Array.from(new Array(6)).map((_, i) => (
                 <div key={i} className="inquiry-card">
                     <div className="card-top">
                         <div>
                             <Skeleton variant="text" width={150} height={24} />
                             <Skeleton variant="text" width={80} height={20} />
                         </div>
                         <Skeleton variant="rectangular" width={90} height={24} style={{borderRadius: 6}} />
                     </div>
                     <div className="card-body">
                         <Skeleton variant="rectangular" height={60} style={{borderRadius: 8, marginBottom: 10}} />
                         <Skeleton variant="text" width="60%" />
                         <Skeleton variant="text" width="50%" />
                     </div>
                 </div>
             ))
        ) : (
            filteredList.length > 0 ? filteredList.map(item => (
                <div key={item.id} className={`inquiry-card ${item.status.toLowerCase()}`}>
                    
                    {/* Header */}
                    <div className="card-top">
                        <div className="info">
                            <h3>{item.fullName}</h3>
                            <span className="course-tag">{item.course || 'General'}</span>
                        </div>
                        <span className="date">
                            <FaCalendarAlt /> {new Date(item.date).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Body */}
                    <div className="card-body">
                        <div className="message-box">
                            "{item.message}"
                        </div>
                        <div className="contact-info">
                            <div><FaEnvelope /> {item.email}</div>
                            <div><FaPhone /> {item.phone}</div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="card-footer">
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                            {item.status === 'CONTACTED' ? <FaCheckDouble /> : <FaClock />} 
                            {item.status}
                        </span>

                        <div className="actions">
                            {item.status === 'PENDING' && (
                                <button className="btn-contact" onClick={() => handleMarkContacted(item.id)}>
                                    Mark Done
                                </button>
                            )}
                            <button className="btn-delete" onClick={() => setDeleteModal({show:true, id:item.id, name:item.fullName})}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="empty-state">No inquiries found.</div>
            )
        )}
      </div>

      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({...deleteModal, show: false})}
        onConfirm={handleDelete}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry?"
        itemName={deleteModal.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default InquiryList;