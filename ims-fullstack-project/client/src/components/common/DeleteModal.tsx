// client/src/components/common/DeleteModal.tsx
import React from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './DeleteModal.scss';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isLoading?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="icon-wrapper danger">
            <FaExclamationTriangle />
          </div>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <h2>{title}</h2>
          <p>
            {message} <strong>"{itemName}"</strong>?
          </p>
          <p className="sub-text">This action cannot be undone.</p>
        </div>

        {/* Footer (Buttons) */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            No, Keep it
          </button>
          <button className="btn-delete" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Yes, Delete It!'}
          </button>
        </div>
      </div>
    </div>
  );
};