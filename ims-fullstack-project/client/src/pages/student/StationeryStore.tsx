// client/src/pages/student/StationeryStore.tsx
import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaBox } from 'react-icons/fa';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { type AlertColor } from '@mui/material/Alert';
import '../admin/inventory/InventoryManager.scss'; // Reuse styles

interface Item { id: string; name: string; category: string; price: number; quantity: number; }

const StationeryStore: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ show: false, type: 'success', msg: '' });

    useEffect(() => {
        fetch('http://localhost:5000/api/inventory').then(r=>r.json()).then(setItems);
    }, []);

    const handleOrder = async (itemId: string) => {
        if(!window.confirm("Place order for this item?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ itemId, quantity: 1, userId: JSON.parse(localStorage.getItem('user')!).id })
            });
            if(res.ok) {
                setAlertInfo({show:true, type:'success', msg:'Order Placed!'});
                // Refresh inventory
                fetch('http://localhost:5000/api/inventory').then(r=>r.json()).then(setItems);
            } else {
                setAlertInfo({show:true, type:'error', msg:'Failed to order'});
            }
        } catch(e) { console.error(e); }
    };

    return (
        <div className="inventory-page">
            <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />
            <div className="page-header"><h2><FaBox /> Stationery Store</h2></div>
            
            <div className="data-grid-container">
                 <div className="grid-header"><span>Item</span><span>Category</span><span>Price</span><span>Action</span></div>
                 <div className="grid-body">
                    {items.filter(i => i.quantity > 0).map(item => (
                        <div key={item.id} className="grid-row">
                            <span className="item-name">{item.name}</span>
                            <span>{item.category}</span>
                            <span className="item-price">₹{item.price}</span>
                            <div className="actions">
                                <button onClick={() => handleOrder(item.id)} style={{color:'#0969da'}}><FaShoppingCart/> Buy</button>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};
export default StationeryStore;