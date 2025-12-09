// client/src/pages/admin/communication/AnnouncementManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaBullhorn, FaPlus, FaTrash, FaUserCircle, FaSearch, FaClock } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { CreateAnnouncementModal, type AnnouncementData } from './CreateAnnouncementModal';
import { type AlertColor } from '@mui/material/Alert';
import { useAuth } from '../../../context/AuthContext';
import './AnnouncementManager.scss'; 

interface Announcement {
  id: string;
  title: string;
  content: string;
  target: string;
  date: string;
  authorId: string; // <--- Added Author ID
  authorName: string;
  authorAvatar: string | null;
}

const AnnouncementManager: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, title: string}>({ show: false, id: '', title: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ show: false, type: 'success', msg: '' });

  // Get Role Name safely
  const getRoleName = () => {
    if (!user || !user.role) return '';
    if (typeof user.role === 'object' && 'name' in user.role) {
        return (user.role as { name: string }).name;
    }
    return String(user.role);
  };
  const userRole = getRoleName().toLowerCase();
  
  // Can Post: Not a Student
  const canPost = userRole !== 'student';

  // Can Delete Helper (Is Super Admin OR Is Owner)
  const canDelete = (authorId: string) => {
      if (userRole === 'super_admin') return true;
      return user?.id === authorId;
  };

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
      console.error(e);
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
            const err = await res.json();
            showAlert('error', err.message || 'Failed to post');
        }
    } catch(e) { 
        console.error(e);
        showAlert('error', 'Network error'); 
    } finally { 
        setIsCreating(false); 
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/announcements/${deleteModal.id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if(res.ok) {
            void fetchAnnouncements();
            setDeleteModal({ show: false, id: '', title: '' });
            showAlert('success', 'Announcement deleted');
        } else {
            const err = await res.json();
            showAlert('error', err.message || 'Failed to delete announcement');
        }
    } catch(e) { 
        console.error(e);
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

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
        <span className="target-badge" style={{
            color: color, 
            backgroundColor: `${color}15`, 
            border: `1px solid ${color}40`
        }}>
            {target === 'ALL' ? 'All' : target}
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
            
            {canPost && (
                <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <FaPlus /> Post New
                </button>
            )}
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="feed-grid">
        {!isLoading && filteredList.map(item => (
            <div key={item.id} className="feed-card">
                <div className="card-header">
                    <div className="author-section">
                         {item.authorAvatar ? (
                             <img 
                                src={`http://localhost:5000${item.authorAvatar}`} 
                                alt="Author" 
                                className="author-avatar"
                             />
                        ) : (
                             <div className="author-placeholder"><FaUserCircle /></div>
                        )}

                        <div className="author-details">
                            <span className="author-name">{item.authorName}</span>
                            <span className="post-date">
                                <FaClock style={{fontSize:'0.7rem', marginRight:'4px'}} />
                                {new Date(item.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="header-right">
                        {getTargetBadge(item.target)}
                        
                        {/* Only show delete button if Super Admin OR Author */}
                        {canDelete(item.authorId) && (
                            <button 
                                className="delete-icon" 
                                onClick={() => setDeleteModal({show:true, id:item.id, title:item.title})}
                                title="Delete Post"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="divider"></div>

                <div className="card-body">
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                </div>
            </div>
        ))}

        {!isLoading && filteredList.length === 0 && (
            <div className="empty-state">
                <p>No announcements found.</p>
            </div>
        )}
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