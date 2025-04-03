import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;
  
  let message = '';
  if (users.length === 1) {
    message = `${users[0].username} is typing...`;
  } else if (users.length === 2) {
    message = `${users[0].username} and ${users[1].username} are typing...`;
  } else {
    message = 'Several people are typing...';
  }
  
  return (
    <Box sx={{ mb: 1, ml: 2 }}>
        <Paper
        elevation={0}
        sx={{
            display: 'inline-flex',
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            maxWidth: '70%',
        }}
        >
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
          {message}
          <span className="typing-animation">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </Typography>
      </Paper>
    </Box>
  );
};

export default TypingIndicator;