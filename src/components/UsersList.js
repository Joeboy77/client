import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const UsersList = ({ activeUsers, currentUser }) => {
  return (
    <Paper 
      elevation={2}
      sx={{ 
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Active Users ({activeUsers.length})
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
        {activeUsers.map((user) => (
          <ListItem
            key={user.id}
            sx={{
              bgcolor: user.username === currentUser ? 'rgba(41, 121, 255, 0.1)' : 'inherit',
              py: 1,
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: user.username === currentUser ? 'primary.main' : 'grey.400' }}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body1" fontWeight={user.username === currentUser ? 'bold' : 'normal'}>
                  {user.username}
                  {user.username === currentUser && ' (You)'}
                </Typography>
              }
            />
          </ListItem>
        ))}
        
        {activeUsers.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No active users
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default UsersList;