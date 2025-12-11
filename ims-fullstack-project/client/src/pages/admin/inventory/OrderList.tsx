// client/src/pages/admin/inventory/OrderList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaShoppingCart, FaCheck, FaTruck, FaSearch, FaBox, FaClipboardList, FaChevronRight } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { type AlertColor } from '@mui/material/Alert';
import './OrderList.scss';
import { ViewOrderModal } from '../../student/ViewOrderModal';

interface OrderItem {
  name: string;
  category: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderedBy: string; 
  status: string;
  date: string;
  totalPrice: number;
  itemSummary: string; 
  itemCount: number;
  items: OrderItem[];
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    void fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (e: React.MouseEvent, id: string, newStatus: string) => {
    e.stopPropagation(); 
    try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status: newStatus })
        });
        if(res.ok) {
            fetchOrders(); 
            showAlert('success', `Order marked as ${newStatus}`);
        } else {
            showAlert('error', 'Update failed');
        }
    } catch(e) { 
        console.error(e);
        showAlert('error', 'Network error'); 
    }
  };

  const openDetails = (order: Order) => {
      setSelectedOrder(order as any); 
      setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(o => 
    o.orderedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.itemSummary.toLowerCase().includes(searchTerm.toLowerCase())
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
                    placeholder="Search User or Items..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      <div className="orders-grid">
        
        {/* --- SKELETON LOADER --- */}
        {loading ? (
            Array.from(new Array(5)).map((_, index) => (
                <div key={index} className="order-card">
                    <div className="card-top">
                        <div className="item-info">
                            <Skeleton variant="text" width={120} height={28} style={{marginBottom: 4}} />
                            <Skeleton variant="rectangular" width={80} height={20} style={{borderRadius: 4}} />
                        </div>
                        <Skeleton variant="rectangular" width={70} height={24} style={{borderRadius: 20}} />
                    </div>
                    <div className="card-details">
                        <Skeleton variant="text" width="90%" height={20} style={{marginBottom: 8}} />
                        <Skeleton variant="text" width="60%" height={20} style={{marginBottom: 8}} />
                        <Skeleton variant="text" width="40%" height={20} />
                    </div>
                    <div className="card-actions" style={{justifyContent: 'flex-start'}}>
                         <Skeleton variant="rectangular" width={90} height={32} style={{borderRadius: 6}} />
                    </div>
                </div>
            ))
        ) : (
            filteredOrders.map(order => (
                <div 
                    key={order.id} 
                    className="order-card"
                    onClick={() => openDetails(order)}
                    style={{cursor: 'pointer'}}
                >
                    <div className="card-top">
                        <div className="item-info">
                            <h3>{order.orderedBy}</h3>
                            <span className="category-tag">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        {getStatusBadge(order.status)}
                    </div>

                    <div className="card-details">
                        <div className="detail-row">
                            <FaClipboardList className="icon" /> 
                            <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'200px'}}>
                                {order.itemSummary}
                            </span>
                        </div>
                        <div className="detail-row">
                            <FaBox className="icon" /> 
                            <span>Total Items: <strong>{order.itemCount}</strong></span>
                        </div>
                        <div className="detail-row">
                            <span>Value: <strong>₹{order.totalPrice.toFixed(2)}</strong></span>
                        </div>
                    </div>

                    <div className="card-actions">
                        {order.status === 'PENDING' && (
                            <button className="btn-approve" onClick={(e) => handleStatusChange(e, order.id, 'APPROVED')}>
                                <FaCheck /> Approve
                            </button>
                        )}
                        {order.status === 'APPROVED' && (
                            <button className="btn-deliver" onClick={(e) => handleStatusChange(e, order.id, 'DELIVERED')}>
                                <FaTruck /> Deliver
                            </button>
                        )}
                        {order.status === 'DELIVERED' && (
                            <span className="completed-text">Completed <FaCheck /></span>
                        )}
                        
                        <FaChevronRight style={{marginLeft:'auto', color:'var(--text-muted-color)'}} />
                    </div>
                </div>
            ))
        )}

        {!loading && filteredOrders.length === 0 && <div className="empty-state">No orders found.</div>}
      </div>

      <ViewOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder} 
      />
    </div>
  );
};

export default OrderList;