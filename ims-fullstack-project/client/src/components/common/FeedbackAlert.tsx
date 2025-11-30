// client/src/components/common/FeedbackAlert.tsx
import React from 'react';
import Alert, { type AlertColor } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { FaTimes } from 'react-icons/fa';

interface FeedbackAlertProps {
  type: AlertColor; 
  title?: string;
  message: string;
  isOpen: boolean;
  onClose?: () => void;
}

const FeedbackAlert: React.FC<FeedbackAlertProps> = ({ 
  type, 
  title, 
  message, 
  isOpen, 
  onClose 
}) => {
  return (
    // --- UPDATED CONTAINER STYLES ---
    <div style={{ 
        position: 'fixed',       // Float above content
        top: '24px',             // Distance from top
        right: '24px',           // Distance from right
        zIndex: 9999,            // Ensure it's on top of Modals (usually 1000)
        minWidth: '320px',       // Consistent width
        maxWidth: '450px',
        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))', // Deep shadow for "floating" effect
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',  // Align right
        pointerEvents: 'none'    // Allow clicking through when hidden
    }}>
      <div style={{ pointerEvents: 'auto', width: '100%' }}> {/* Re-enable clicks for the alert itself */}
        <Collapse in={isOpen}>
          <Alert
            severity={type}
            variant="filled" 
            action={
              onClose ? (
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={onClose}
                >
                  <FaTimes style={{ fontSize: '0.9rem' }} />
                </IconButton>
              ) : null
            }
            sx={{ 
              borderRadius: 2, 
              fontWeight: 500,
              fontSize: '0.95rem',
              // High-End Colors
              '&.MuiAlert-filledSuccess': { backgroundColor: '#1a7f37' }, // GitHub Green
              '&.MuiAlert-filledError': { backgroundColor: '#cf222e' },   // GitHub Red
              '&.MuiAlert-filledInfo': { backgroundColor: '#0969da' },    // GitHub Blue
              '&.MuiAlert-filledWarning': { backgroundColor: '#9a6700' }, // GitHub Orange
            }}
          >
            {title && <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>}
            {message}
          </Alert>
        </Collapse>
      </div>
    </div>
  );
};

export default FeedbackAlert;