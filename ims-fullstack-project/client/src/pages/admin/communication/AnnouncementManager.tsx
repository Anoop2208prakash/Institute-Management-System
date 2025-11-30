// client/src/pages/admin/communication/AnnouncementManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaBullhorn, FaPlus, FaTrash, FaUserCircle, FaClock, FaSearch } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import LinearLoader from '../../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import './AnnouncementManager.scss'; 
import { CreateAnnouncementModal, type AnnouncementData } from './CreateAnnouncementModal';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target: string;
  date: string;
  authorName: string;
}

const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, title: string}>({ show: false, id: '', title: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ show: false, type: 'success', msg: '' });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/announcements');
      if (res.ok) setAnnouncements(await res.json());
    } catch (e) {
      console.error(e); // FIX: Log error
      showAlert('error', 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleCreate = async (data: AnnouncementData) => {
    setIsCreating(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            void fetchAnnouncements();
            setIsCreateModalOpen(false);
            showAlert('success', 'Announcement posted successfully');
        } else {
            showAlert('error', 'Failed to post announcement');
        }
    } catch(e) { 
        console.error(e); // FIX: Log error
        showAlert('error', 'Network error'); 
    } finally { 
        setIsCreating(false); 
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        const res = await fetch(`http://localhost:5000/api/announcements/${deleteModal.id}`, { method: 'DELETE' });
        if(res.ok) {
            void fetchAnnouncements();
            setDeleteModal({ show: false, id: '', title: '' });
            showAlert('success', 'Announcement deleted');
        } else {
            showAlert('error', 'Failed to delete announcement');
        }
    } catch(e) { 
        console.error(e); // FIX: Log error
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  // Filter
  const filteredList = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTargetBadge = (target: string) => {
      let color = '#0969da';
      if (target === 'STUDENT') color = '#1a7f37';
      if (target === 'TEACHER') color = '#8250df';
      if (target === 'ADMIN') color = '#cf222e';
      return (
        <span style={{
            fontSize:'0.75rem', fontWeight:700, padding:'2px 8px', borderRadius:'12px',
            backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40`
        }}>
            {target}
        </span>
      );
  };

  return (
    <div className="announcement-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaBullhorn /> Announcements</h2>
            <p>Broadcast messages to Students, Teachers, or Everyone.</p>
        </div>
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search notices..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus /> Post New
            </button>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="feed-grid">
        {isLoading && <div style={{gridColumn:'1/-1'}}><LinearLoader /></div>}
        
        {filteredList.map(item => (
            <div key={item.id} className="feed-card">
                <div className="card-header">
                    <div className="author-info">
                        <FaUserCircle className="avatar-icon" />
                        <div>
                            <span className="author-name">{item.authorName}</span>
                            <div className="meta">
                                <FaClock /> {new Date(item.date).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        {getTargetBadge(item.target)}
                        <button className="delete-icon" onClick={() => setDeleteModal({show:true, id:item.id, title:item.title})}>
                            <FaTrash />
                        </button>
                    </div>
                </div>
                
                <div className="card-body">
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                </div>
            </div>
        ))}

        {!isLoading && filteredList.length === 0 && <div className="empty-state"><p>No announcements found.</p></div>}
      </div>

      <CreateAnnouncementModal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSave={handleCreate} 
        isLoading={isCreating} 
      />

      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({...deleteModal, show: false})}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete"
        itemName={deleteModal.title}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AnnouncementManager;