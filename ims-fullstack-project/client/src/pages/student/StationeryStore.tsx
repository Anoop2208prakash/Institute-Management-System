// client/src/pages/student/StationeryStore.tsx
import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaBox, FaTag, FaLayerGroup, FaSearch, FaMinus, FaPlus, FaCheckCircle } from 'react-icons/fa';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { ConfirmationModal } from '../../components/common/ConfirmationModal'; // <--- Import Modal
import { type AlertColor } from '@mui/material/Alert';
import './StationeryStore.scss';

interface Item { id: string; name: string; category: string; price: number; quantity: number; }

const StationeryStore: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Used for button loading state now
    
    // Filter State
    const [filterCategory, setFilterCategory] = useState<'All' | 'Uniform' | 'Stationery'>('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Cart State: { itemId: quantity }
    const [cart, setCart] = useState<Record<string, number>>({});
    
    // Modal & Alert State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
        show: false, type: 'success', msg: '' 
    });

    // Initial Fetch
    useEffect(() => {
        fetch('http://localhost:5000/api/inventory')
            .then(r => r.json())
            .then(data => setItems(data))
            .catch(console.error);
    }, []);

    // --- Cart Actions ---
    const addToCart = (id: string) => {
        setCart(prev => ({ ...prev, [id]: 1 }));
    };

    const increment = (id: string, max: number) => {
        setCart(prev => {
            const current = prev[id] || 0;
            if (current >= max) return prev; 
            return { ...prev, [id]: current + 1 };
        });
    };

    const decrement = (id: string) => {
        setCart(prev => {
            const current = prev[id];
            if (current <= 1) {
                const newCart = { ...prev };
                delete newCart[id]; 
                return newCart;
            }
            return { ...prev, [id]: current - 1 };
        });
    };

    // Calculate Totals
    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = items.find(i => i.id === id);
        return sum + (item ? item.price * qty : 0);
    }, 0);

    // --- Checkout Logic ---
    
    // 1. Open Modal
    const initiateCheckout = () => {
        if (totalItems === 0) return;
        setIsConfirmOpen(true);
    };

    // 2. Perform Checkout (Called by Modal)
    const handleConfirmCheckout = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if(!userStr) return;
            const userId = JSON.parse(userStr).id;

            // Execute orders in parallel
            const promises = Object.entries(cart).map(([itemId, quantity]) => 
                fetch('http://localhost:5000/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ itemId, quantity, userId })
                })
            );

            await Promise.all(promises);

            setAlertInfo({show:true, type:'success', msg:'Order Placed Successfully!'});
            setCart({}); // Clear cart
            setIsConfirmOpen(false); // Close Modal
            
            // Refresh Inventory
            fetch('http://localhost:5000/api/inventory').then(r=>r.json()).then(setItems);

        } catch(e) { 
            console.error(e);
            setAlertInfo({show:true, type:'error', msg:'Failed to place order'});
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Logic
    const filteredItems = items.filter(i => {
        const matchesCategory = filterCategory === 'All' || i.category === filterCategory;
        const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
        const inStock = i.quantity > 0;
        return matchesCategory && matchesSearch && inStock;
    });

    return (
        <div className="stationery-page">
            <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />
            
            <div className="page-header">
                <div className="header-content">
                    <h2><FaBox /> Stationery Store</h2>
                    <p>Purchase uniforms and stationery items directly.</p>
                </div>
            </div>

            {/* --- Filter Bar --- */}
            <div className="filter-bar">
                <div className="tabs">
                    <button className={filterCategory === 'All' ? 'active' : ''} onClick={() => setFilterCategory('All')}>All</button>
                    <button className={filterCategory === 'Uniform' ? 'active' : ''} onClick={() => setFilterCategory('Uniform')}>Uniforms</button>
                    <button className={filterCategory === 'Stationery' ? 'active' : ''} onClick={() => setFilterCategory('Stationery')}>Stationery</button>
                </div>
                <div className="search-box">
                    <FaSearch style={{color: 'var(--text-muted-color)'}}/>
                    <input placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>
            
            {/* Store Grid */}
            <div className="store-grid">
                    {filteredItems.length > 0 ? filteredItems.map(item => {
                        const inCartQty = cart[item.id] || 0;

                        return (
                        <div key={item.id} className="store-card">
                            
                            <div className="card-header">
                                <div className="item-section">
                                    <div className="item-icon-box">
                                        <FaTag />
                                    </div>
                                    <div className="item-details">
                                        <span className="item-name">{item.name}</span>
                                        <div className="item-meta">
                                            <span><FaLayerGroup style={{fontSize:'0.8rem'}}/> {item.quantity} in stock</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="header-right">
                                    <span className="category-badge">{item.category}</span>
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="card-body">
                                <span className="price-tag">₹{item.price.toFixed(2)}</span>
                                
                                {/* Buy Button / Qty Control */}
                                {inCartQty === 0 ? (
                                    <button className="buy-btn" onClick={() => addToCart(item.id)}>
                                        <FaShoppingCart /> Buy Now
                                    </button>
                                ) : (
                                    <div className="qty-control">
                                        <button onClick={() => decrement(item.id)}><FaMinus /></button>
                                        <span>{inCartQty}</span>
                                        <button onClick={() => increment(item.id, item.quantity)}><FaPlus /></button>
                                    </div>
                                )}
                            </div>

                        </div>
                        );
                    }) : (
                    <div className="empty-state">No items available.</div>
                )}
            </div>

            {/* --- Floating Cart Summary --- */}
            {totalItems > 0 && (
                <div className="cart-bar">
                    <div className="cart-info">
                        <span>Total ({totalItems} items)</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <button className="btn-checkout" onClick={initiateCheckout}>
                        Confirm Order <FaCheckCircle />
                    </button>
                </div>
            )}

            {/* --- Confirmation Modal --- */}
            <ConfirmationModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmCheckout}
                title="Confirm Purchase"
                message={`Are you sure you want to purchase ${totalItems} items for a total of ₹${totalPrice.toFixed(2)}?`}
                confirmText="Yes, Place Order"
                variant="success"
                isLoading={isLoading}
            />
        </div>
    );
};

export default StationeryStore;