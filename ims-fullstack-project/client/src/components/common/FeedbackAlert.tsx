// client/src/components/common/FeedbackAlert.tsx
import React from 'react';
import Alert, { type AlertColor } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box'; // <--- Import Box for responsive styles
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
    // Used 'Box' instead of 'div' to enable the 'sx' prop for responsiveness
    <Box 
      sx={{ 
        position: 'fixed',
        zIndex: 9999,
        
        // --- Responsive Positioning ---
        // Mobile (xs): 16px from top/left/right (stretches across)
        // Desktop (sm): 24px from top/right, auto width
        top: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        left: { xs: 16, sm: 'auto' }, 
        
        // --- Responsive Sizing ---
        minWidth: { xs: 'auto', sm: '350px' }, 
        maxWidth: { xs: '100%', sm: '450px' },
        
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none', // Allow clicking through empty space
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
      }}
    >
      <div style={{ pointerEvents: 'auto', width: '100%' }}>
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
              borderRadius: 3, 
              fontWeight: 500,
              fontSize: '0.95rem',
              boxShadow: 2,
              
              // Custom Colors
              '&.MuiAlert-filledSuccess': { backgroundColor: '#1a7f37' },
              '&.MuiAlert-filledError': { backgroundColor: '#cf222e' },
              '&.MuiAlert-filledInfo': { backgroundColor: '#0969da' },
              '&.MuiAlert-filledWarning': { backgroundColor: '#9a6700' },
            }}
          >
            {title && <AlertTitle sx={{ fontWeight: 800, mb: 0.5 }}>{title}</AlertTitle>}
            {message}
          </Alert>
        </Collapse>
      </div>
    </Box>
  );
};

export default FeedbackAlert;