// client/src/pages/student/MyOrders.tsx
import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaBox, FaClock } from 'react-icons/fa';
import LinearLoader from '../../components/common/LinearLoader';
import './MyOrders.scss';

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

  return (
    <div className="student-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaShoppingCart /> My Orders</h2>
            <p>History of stationery purchases.</p>
        </div>
      </div>

      {loading ? <LinearLoader /> : (
        <div className="list-container">
            {orders.length > 0 ? orders.map(order => (
                <div key={order.id} className="list-item">
                    <div className="item-left">
                        <div style={{
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
                    
                    <div style={{textAlign:'right'}}>
                        <span style={{display:'block', fontWeight:700}}>₹{order.totalPrice.toFixed(2)}</span>
                        <span style={{
                            fontSize:'0.75rem', fontWeight:700, 
                            color: order.status === 'DELIVERED' ? '#1a7f37' : '#d29922'
                        }}>
                            {order.status}
                        </span>
                    </div>
                </div>
            )) : (
                <div className="empty-state">No orders placed yet.</div>
            )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;