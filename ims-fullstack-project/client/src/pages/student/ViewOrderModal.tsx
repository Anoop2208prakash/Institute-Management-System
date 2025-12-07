// client/src/components/student/ViewOrderModal.tsx
import React from 'react';
import { FaTimes, FaReceipt, FaHashtag } from 'react-icons/fa';
import { type Order } from '../../pages/student/MyOrders'; // Import the Order type
import './ViewOrderModal.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const ViewOrderModal: React.FC<Props> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const getStatusStyle = (status: string) => {
      if (status === 'DELIVERED') return { bg: 'rgba(26, 127, 55, 0.1)', color: '#1a7f37' };
      if (status === 'APPROVED') return { bg: 'rgba(9, 105, 218, 0.1)', color: '#0969da' };
      return { bg: 'rgba(210, 153, 34, 0.1)', color: '#d29922' };
  };

  const statusStyle = getStatusStyle(order.status);

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3><FaReceipt /> Order Receipt</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body">
            
            <div className="order-id-badge">
                <FaHashtag className="icon" />
                <div>
                    <span className="label">Order Reference ID</span>
                    <span className="value">{order.id.substring(0, 8).toUpperCase()}</span>
                </div>
            </div>

            <div className="details-grid">
                <div className="info-row">
                    <span className="label">Order Date</span>
                    <span className="value">{new Date(order.date).toLocaleString()}</span>
                </div>

                <div className="info-row">
                    <span className="label">Status</span>
                    <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {order.status}
                    </span>
                </div>
                
                {/* ITEMS LIST */}
                <div style={{margin: '1.5rem 0', borderTop: '1px dashed var(--border-light-color)', borderBottom: '1px dashed var(--border-light-color)', padding: '1rem 0'}}>
                    <span className="label" style={{fontSize:'0.85rem', textTransform:'uppercase', marginBottom:'10px', display:'block'}}>Items Purchased</span>
                    
                    {order.items.map((item, idx) => (
                        <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'0.95rem'}}>
                            <span>{item.name} <span style={{color:'var(--text-muted-color)', fontSize:'0.85rem'}}>({item.category})</span></span>
                            <span style={{fontWeight:600}}>
                                {item.qty} x ₹{item.price}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="info-row total">
                    <span className="label">Total Paid</span>
                    <span className="value">₹{order.totalPrice.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};