// client/src/components/common/DeleteButton.tsx
import React from 'react';
import { FaTrash, FaSpinner } from 'react-icons/fa';

interface DeleteButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, isLoading, disabled }) => {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering row clicks
        onClick();
      }}
      disabled={isLoading || disabled}
      style={{
        background: 'transparent',
        border: 'none',
        color: disabled ? '#ccc' : '#cf222e', // Red for delete
        cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s'
      }}
      title="Delete"
    >
      {isLoading ? (
        <FaSpinner className="fa-spin" /> // You might need CSS for spin animation or use standard icon
      ) : (
        <FaTrash />
      )}
    </button>
  );
};