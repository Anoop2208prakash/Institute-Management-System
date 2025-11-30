// client/src/pages/admin/inventory/OrderList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaShoppingCart, FaCheck, FaTruck, FaSearch, FaUser, FaBox } from 'react-icons/fa';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import LinearLoader from '../../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import './OrderList.scss';

interface Order {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  totalPrice: number;
  orderedBy: string;
  status: string;
  date: string;
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error(e); // FIX: Log error
      showAlert('error', 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status: newStatus })
        });
        if(res.ok) {
            void fetchOrders();
            showAlert('success', `Order marked as ${newStatus}`);
        } else {
            showAlert('error', 'Update failed');
        }
    } catch(e) { 
        console.error(e); // FIX: Log error
        showAlert('error', 'Network error'); 
    }
  };

  const filteredOrders = orders.filter(o => 
    o.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.orderedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'PENDING': return <span className="badge pending">Pending</span>;
          case 'APPROVED': return <span className="badge approved">Approved</span>;
          case 'DELIVERED': return <span className="badge delivered">Delivered</span>;
          default: return <span className="badge">{status}</span>;
      }
  };

  return (
    <div className="order-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaShoppingCart /> View Orders</h2>
            <p>Track and fulfill inventory requests.</p>
        </div>
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search Order or User..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="orders-grid">
        {isLoading && <div style={{gridColumn:'1/-1'}}><LinearLoader /></div>}
        
        {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
                <div className="card-top">
                    <div className="item-info">
                        <h3>{order.itemName}</h3>
                        <span className="category-tag">{order.category}</span>
                    </div>
                    {getStatusBadge(order.status)}
                </div>

                <div className="card-details">
                    <div className="detail-row">
                        <FaBox className="icon" /> 
                        <span>Quantity: <strong>{order.quantity}</strong></span>
                    </div>
                    <div className="detail-row">
                        <FaUser className="icon" /> 
                        <span>User: {order.orderedBy}</span>
                    </div>
                    <div className="detail-row">
                        <span>Total: <strong>${order.totalPrice.toFixed(2)}</strong></span>
                    </div>
                </div>

                <div className="card-actions">
                    {order.status === 'PENDING' && (
                        <button className="btn-approve" onClick={() => handleStatusChange(order.id, 'APPROVED')}>
                            <FaCheck /> Approve
                        </button>
                    )}
                    {order.status === 'APPROVED' && (
                        <button className="btn-deliver" onClick={() => handleStatusChange(order.id, 'DELIVERED')}>
                            <FaTruck /> Deliver
                        </button>
                    )}
                    {order.status === 'DELIVERED' && (
                        <span className="completed-text">Order Completed</span>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;