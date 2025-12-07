// client/src/components/student/ViewOrderModal.tsx
import React from 'react';
import { FaTimes, FaReceipt, FaHashtag } from 'react-icons/fa';
import './ViewOrderModal.scss'; // <--- Import new SCSS

interface Order {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  totalPrice: number;
  status: string;
  date: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const ViewOrderModal: React.FC<Props> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const getStatusStyle = (status: string) => {
      if (status === 'DELIVERED') return { bg: 'rgba(26, 127, 55, 0.1)', color: '#1a7f37' }; // Green
      if (status === 'APPROVED') return { bg: 'rgba(9, 105, 218, 0.1)', color: '#0969da' }; // Blue
      return { bg: 'rgba(210, 153, 34, 0.1)', color: '#d29922' }; // Orange (Pending)
  };

  const statusStyle = getStatusStyle(order.status);

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h3><FaReceipt /> Order Receipt</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Body */}
        <div className="modal-body">
            
            {/* Order ID Badge */}
            <div className="order-id-badge">
                <FaHashtag className="icon" />
                <div>
                    <span className="label">Order Reference ID</span>
                    <span className="value">{order.id.substring(0, 8).toUpperCase()}</span>
                </div>
            </div>

            {/* Item Details */}
            <div className="details-grid">
                <div className="info-row">
                    <span className="label">Item Name</span>
                    <span className="value">{order.itemName}</span>
                </div>
                <div className="info-row">
                    <span className="label">Category</span>
                    <span className="value">{order.category}</span>
                </div>
                <div className="info-row">
                    <span className="label">Quantity</span>
                    <span className="value">x{order.quantity}</span>
                </div>
                <div className="info-row">
                    <span className="label">Order Date</span>
                    <span className="value">{new Date(order.date).toLocaleDateString()}</span>
                </div>
                
                <div className="info-row total">
                    <span className="label">Total Paid</span>
                    <span className="value">₹{order.totalPrice.toFixed(2)}</span>
                </div>

                <div className="info-row" style={{marginTop:'1rem'}}>
                    <span className="label">Current Status</span>
                    <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {order.status}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};