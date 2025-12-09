// client/src/pages/admin/admission/InquiryList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaEnvelopeOpenText, FaSearch, FaPhone, FaTrash, FaCheckDouble, FaEnvelope } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import LinearLoader from '../../../components/common/LinearLoader';
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
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
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
            <p>Track and manage new student leads.</p>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      {/* Controls Bar */}
      <div className="controls-bar">
          <div className="count-badge">Total Inquiries: {filteredList.length}</div>
          <div className="search-box">
              <FaSearch />
              <input 
                  placeholder="Search name or email..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
              />
          </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <div className="table-header">
            <span>Details</span>
            <span>Contact Info</span>
            <span>Message</span>
            <span>Status</span>
            <span>Action</span>
        </div>
        
        {loading && <div style={{padding:'2rem'}}><LinearLoader /></div>}

        {!loading && (
            <div className="table-body">
                {filteredList.length > 0 ? filteredList.map(item => (
                    <div key={item.id} className="inquiry-row">
                        
                        {/* 1. Info */}
                        <div className="info">
                            <span className="name">{item.fullName}</span>
                            <span className="course">{item.course || 'General'}</span>
                            <span className="date">{new Date(item.date).toLocaleDateString()}</span>
                        </div>

                        {/* 2. Contact */}
                        <div className="contact">
                            <div><FaEnvelope /> {item.email}</div>
                            <div><FaPhone /> {item.phone}</div>
                        </div>

                        {/* 3. Message */}
                        <div className="message">
                            "{item.message}"
                        </div>

                        {/* 4. Status */}
                        <div className="status-cell">
                            <span className={`status-pill ${item.status.toLowerCase()}`}>
                                {item.status}
                            </span>
                        </div>

                        {/* 5. Actions */}
                        <div className="action-cell">
                            {item.status === 'PENDING' && (
                                <button className="btn-contact" onClick={() => handleMarkContacted(item.id)}>
                                    <FaCheckDouble /> Mark Done
                                </button>
                            )}
                            <button className="btn-delete" onClick={() => setDeleteModal({show:true, id:item.id, name:item.fullName})}>
                                <FaTrash /> Delete
                            </button>
                        </div>

                    </div>
                )) : (
                    <div className="empty-state">No inquiries found.</div>
                )}
            </div>
        )}
      </div>

      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({...deleteModal, show: false})}
        onConfirm={handleDelete}
        title="Delete Inquiry"
        message="Are you sure you want to delete the inquiry from"
        itemName={deleteModal.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default InquiryList;