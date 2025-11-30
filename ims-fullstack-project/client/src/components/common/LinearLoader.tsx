// client/src/components/common/LinearLoader.tsx
import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

const LinearLoader: React.FC = () => {
  return (
    <Box sx={{ width: '100%', marginTop: '1rem' }}>
      <LinearProgress 
        sx={{
          height: 6, // Thicker, premium feel
          borderRadius: 3, // Rounded corners
          backgroundColor: 'var(--border-light-color)', // Track color from your theme
          '& .MuiLinearProgress-bar': {
            backgroundColor: 'var(--primary-color)', // Bar color from your theme
          }
        }} 
      />
      <p style={{ 
          textAlign: 'center', 
          marginTop: '0.5rem', 
          fontSize: '0.85rem', 
          color: 'var(--text-muted-color)' 
      }}>
        Processing...
      </p>
    </Box>
  );
};

export default LinearLoader;