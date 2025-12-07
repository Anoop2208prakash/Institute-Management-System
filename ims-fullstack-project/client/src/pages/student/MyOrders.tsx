// client/src/pages/student/MyOrders.tsx
import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaBox, FaClock, FaChevronRight } from 'react-icons/fa';
// Removed LinearLoader import
import './MyOrders.scss';
import { ViewOrderModal } from './ViewOrderModal';

interface Order {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  totalPrice: number;
  status: string;
  date: string;
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/orders/my-orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setOrders(await res.json());
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOrderClick = (order: Order) => {
      setSelectedOrder(order);
      setIsModalOpen(true);
  };

  return (
    <div className="student-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaShoppingCart /> My Orders</h2>
            <p>History of your purchases and requests.</p>
        </div>
      </div>

      <div className="list-container">
            {/* Loader Removed - Using simple conditional rendering for empty state */}
            
            {!loading && orders.length > 0 ? orders.map(order => (
                <div 
                    key={order.id} 
                    className="list-item" 
                    onClick={() => handleOrderClick(order)} // <--- Click handler
                    style={{cursor:'pointer'}} // Visual cue
                >
                    <div className="item-left">
                        <div className="icon-box" style={{
                            width:'40px', height:'40px', borderRadius:'8px', 
                            background:'var(--bg-secondary-color)', color:'var(--primary-color)',
                            display:'flex', alignItems:'center', justifyContent:'center'
                        }}>
                            <FaBox />
                        </div>
                        <div className="details">
                            <span className="date">{order.itemName} ({order.quantity})</span>
                            <span className="sub-text">
                                <FaClock style={{fontSize:'0.7rem', marginRight:'4px'}}/> 
                                {new Date(order.date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    
                    <div style={{textAlign:'right', display:'flex', alignItems:'center', gap:'1rem'}}>
                        <div style={{textAlign:'right'}}>
                            <span style={{display:'block', fontWeight:700}}>₹{order.totalPrice.toFixed(2)}</span>
                            <span style={{
                                fontSize:'0.75rem', fontWeight:700, 
                                color: order.status === 'DELIVERED' ? '#1a7f37' : '#d29922'
                            }}>
                                {order.status}
                            </span>
                        </div>
                        <FaChevronRight style={{color:'var(--text-muted-color)', fontSize:'0.8rem'}} />
                    </div>
                </div>
            )) : (
                !loading && <div className="empty-state">No orders placed yet.</div>
            )}
      </div>

      {/* Details Modal */}
      <ViewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default MyOrders;