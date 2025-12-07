// client/src/pages/student/MyInvoices.tsx
import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
// Removed LinearLoader
import './MyInvoices.scss';
import { InvoiceModal } from './InvoiceModal';

interface Invoice {
  id: string;
  title: string;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
}

const MyInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/students/my-invoices', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setInvoices(await res.json());
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const openInvoice = (inv: Invoice) => {
      setSelectedInvoice(inv);
      setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'PAID': return { icon: <FaCheckCircle/>, color: '#1a7f37', bg: 'rgba(26, 127, 55, 0.1)' };
          case 'PENDING': return { icon: <FaClock/>, color: '#d29922', bg: 'rgba(210, 153, 34, 0.1)' };
          case 'OVERDUE': return { icon: <FaExclamationTriangle/>, color: '#cf222e', bg: 'rgba(207, 34, 46, 0.1)' };
          default: return { icon: <FaClock/>, color: '#0969da', bg: 'rgba(9, 105, 218, 0.1)' };
      }
  };

  return (
    <div className="student-page">
      <div className="page-header">
        <div className="header-content">
            <h2><FaFileInvoiceDollar /> My Invoices</h2>
            <p>Track your tuition and fee payments.</p>
        </div>
      </div>

      <div className="list-container">
          {/* Loader Removed */}
          
          {!loading && invoices.length > 0 ? invoices.map(inv => {
              const style = getStatusBadge(inv.status);
              return (
                  <div 
                      key={inv.id} 
                      className="list-item"
                      onClick={() => openInvoice(inv)} 
                      style={{cursor: 'pointer'}} 
                  >
                      <div className="item-left">
                          <div style={{color: style.color, fontSize:'1.2rem'}}>{style.icon}</div>
                          <div className="details">
                              <span className="date">{inv.title}</span>
                              <span className="sub-text">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                          </div>
                      </div>
                      
                      <div style={{textAlign:'right'}}>
                          <span style={{display:'block', fontWeight:700, fontSize:'1rem'}}>
                              ₹{Number(inv.amount).toFixed(2)}
                          </span>
                          <span style={{
                              fontSize:'0.75rem', fontWeight:700, 
                              color: style.color, backgroundColor: style.bg,
                              padding:'2px 8px', borderRadius:'12px'
                          }}>
                              {inv.status}
                          </span>
                      </div>
                  </div>
              );
          }) : (
              !loading && <div className="empty-state">No invoices found.</div>
          )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default MyInvoices;