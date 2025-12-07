// client/src/components/common/DeleteModal.tsx
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './DeleteModal.scss';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
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
    <div className="delete-modal-overlay">
      <div className="delete-modal-container">
        
        <div className="icon-wrapper">
          <FaExclamationTriangle />
        </div>

        <div className="content">
          <h3>{title}</h3>
          <p>
            {message} {itemName && <strong>"{itemName}"</strong>}? <br/>
            This action cannot be undone.
          </p>
        </div>

        <div className="actions">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>

      </div>
    </div>
  );
};