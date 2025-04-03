import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Avatar,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const Login = ({ onJoin, loading }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    onJoin(username);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <ChatIcon fontSize="large" />
          </Avatar>
          
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Welcome to ChatRoom
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Enter your username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 2, 
                mb: 2,
                py: 1.5,
                fontWeight: 'bold',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Join Chat'}
            </Button>
            
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Enter any username to start chatting with others
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;