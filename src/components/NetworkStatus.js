import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const NetworkStatus = ({ isConnected, reconnecting = false }) => {
  return (
    <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 1200 }}>
      <Chip
        icon={isConnected ? <WifiIcon /> : <WifiOffIcon />}
        label={
          <Typography variant="caption">
            {reconnecting ? 'Reconnecting...' : (isConnected ? 'Connected' : 'Disconnected')}
          </Typography>
        }
        color={isConnected ? 'success' : 'error'}
        variant="outlined"
        size="small"
        sx={{ 
          opacity: 0.8,
          '&:hover': {
            opacity: 1
          }
        }}
      />
    </Box>
  );
};

export default NetworkStatus;