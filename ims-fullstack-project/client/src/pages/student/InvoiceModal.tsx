// client/src/components/student/InvoiceModal.tsx
import React from 'react';
import { FaTimes, FaFileInvoice, FaPrint} from 'react-icons/fa';
import './InvoiceModal.scss';

interface Invoice {
  id: string;
  title: string;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoiceModal: React.FC<Props> = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  const getStatusColor = (status: string) => {
      if (status === 'PAID') return { bg: '#dcfce7', text: '#166534' }; // Green
      if (status === 'OVERDUE') return { bg: '#fee2e2', text: '#991b1b' }; // Red
      return { bg: '#fef9c3', text: '#854d0e' }; // Yellow/Gold
  };

  const statusStyle = getStatusColor(invoice.status);

  return (
    <div className="invoice-modal-overlay" onClick={onClose}>
      <div className="invoice-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header (Screen Only) */}
        <div className="modal-header">
          <h3><FaFileInvoice /> Invoice Details</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Invoice Content (Printable) */}
        <div className="invoice-content">
            
            <div className="invoice-top">
                <div className="brand">
                    <h1>IMS INSTITUTE</h1>
                    <p>123 Knowledge Park, Edu City</p>
                </div>
                <div className="invoice-meta">
                    <span className="label">Invoice No</span>
                    <span className="number">#{invoice.id.substring(0, 8).toUpperCase()}</span>
                </div>
            </div>

            <div className="info-grid">
                <div className="info-group">
                    <label>Issued Date</label>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="info-group">
                    <label>Due Date</label>
                    <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="info-group">
                    <label>Status</label>
                    <div>
                        <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                            {invoice.status}
                        </span>
                    </div>
                </div>
                {invoice.paidDate && (
                    <div className="info-group">
                        <label>Paid On</label>
                        <span>{new Date(invoice.paidDate).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            <table className="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{invoice.title}</td>
                        <td>₹{Number(invoice.amount).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div className="total-section">
                <div className="total-box">
                    <div className="row">
                        <span>Subtotal</span>
                        <span>₹{Number(invoice.amount).toFixed(2)}</span>
                    </div>
                    <div className="row">
                        <span>Tax (0%)</span>
                        <span>₹0.00</span>
                    </div>
                    <div className="final-total">
                        <span>Total Due</span>
                        <span>₹{Number(invoice.amount).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer (Screen Only) */}
        <div className="modal-footer">
            <span className="note">Generated electronically. Signature not required.</span>
            <button onClick={() => window.print()}>
                <FaPrint /> Print Invoice
            </button>
        </div>

      </div>
    </div>
  );
};