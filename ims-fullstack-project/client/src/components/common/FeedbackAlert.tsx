// client/src/components/common/FeedbackAlert.tsx
import React, { useEffect } from 'react';
import Alert, { type AlertColor } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
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

  // Auto-close logic: Closes after 5 seconds
  useEffect(() => {
    if (isOpen && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // 5000ms = 5 seconds

      // Cleanup timer if component unmounts or isOpen changes
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 9999,
        top: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        left: { xs: 16, sm: 'auto' },
        minWidth: { xs: 'auto', sm: '350px' },
        maxWidth: { xs: '100%', sm: '450px' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
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
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: 4,

              // --- Theme-Based Colors from _themes.scss ---
              '&.MuiAlert-filledSuccess': {
                backgroundColor: 'var(--font-color-success)' // #1a7f37
              },
              '&.MuiAlert-filledError': {
                backgroundColor: 'var(--font-color-danger)' // #cf222e
              },
              '&.MuiAlert-filledInfo': {
                backgroundColor: 'var(--primary-color)' // #0969da
              },
              '&.MuiAlert-filledWarning': {
                backgroundColor: 'var(--toast-warning-text)' // #9a6700
              },
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