import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { format } from 'date-fns';

const ChatNotification = ({ notification }) => {
  const time = format(new Date(notification.timestamp), 'h:mm a');
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        my: 1,
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 0.5,
          bgcolor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {notification.type === 'join' && `${notification.username} joined the chat`}
          {notification.type === 'leave' && `${notification.username} left the chat`}
          <span style={{ marginLeft: 8, fontSize: '0.85em' }}>{time}</span>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatNotification;