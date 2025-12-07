// client/src/components/common/ConfirmationModal.tsx
import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimes, FaInfoCircle } from 'react-icons/fa';
import './ConfirmationModal.scss';

type ModalVariant = 'danger' | 'success' | 'warning' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string; // e.g. "Yes, Place Order"
  cancelText?: string;
  isLoading?: boolean;
  variant?: ModalVariant; // Controls the color theme
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = 'info'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger': return <FaTimes />;
      case 'success': return <FaCheckCircle />;
      case 'warning': return <FaExclamationTriangle />;
      default: return <FaInfoCircle />;
    }
  };

  return (
    <div className="confirmation-modal-overlay">
      <div className={`confirmation-modal-container ${variant}`}>
        
        {/* Icon Header */}
        <div className="icon-wrapper">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="content">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>

        {/* Actions */}
        <div className="actions">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </button>
          <button className="btn-confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};