import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme, Snackbar, Alert } from '@mui/material';
import io from 'socket.io-client';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { FeedbackProvider, useFeedback } from './contexts/FeedbackContext';
import FeedbackSnackbar from './components/FeedbackSnackbar';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';

const SOCKET_URL = 'http://localhost:8080';

const AppWithTheme = () => {
  const { darkMode } = useTheme();
  const { showError, showSuccess, showInfo } = useFeedback();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#60a5fa' : '#1976d2',
        light: darkMode ? '#93c5fd' : '#42a5f5',
        dark: darkMode ? '#3b82f6' : '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: darkMode ? '#f472b6' : '#e91e63',
        light: darkMode ? '#f9a8d4' : '#f48fb1',
        dark: darkMode ? '#ec4899' : '#c2185b',
        contrastText: '#ffffff',
      },
      error: {
        main: darkMode ? '#ef4444' : '#d32f2f',
      },
      warning: {
        main: darkMode ? '#f59e0b' : '#ed6c02',
      },
      info: {
        main: darkMode ? '#0ea5e9' : '#0288d1',
      },
      success: {
        main: darkMode ? '#10b981' : '#2e7d32',
      },
      background: {
        default: darkMode ? '#121212' : '#f8fafc',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#e2e8f0' : '#334155',
        secondary: darkMode ? '#94a3b8' : '#64748b',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h6: {
        fontWeight: 500,
      },
      body1: {
        fontSize: '0.9375rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
    },
    shadows: [
      'none',
      '0px 2px 1px -1px rgba(0,0,0,0.1),0px 1px 1px 0px rgba(0,0,0,0.07),0px 1px 3px 0px rgba(0,0,0,0.06)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    console.log('Initializing socket connection...');
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'], 
      upgrade: false, 
      reconnectionAttempts: 10, 
      reconnectionDelay: 2000, 
      timeout: 30000, 
      autoConnect: true, 
      forceNew: true
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to server with ID:', newSocket.id);
      setIsConnected(true);
      if (reconnecting) {
        setReconnecting(false);
        showSuccess('Connection restored!');
      }
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server. Reason:', reason);
      setIsConnected(false);
      showError('Lost connection to server: ' + reason);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      showError('Connection error: ' + error.message);
    });
    
    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
      setReconnecting(true);
      showInfo(`Attempting to reconnect (${attempt})...`);
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setReconnecting(false);
      showSuccess('Connection restored!');
    });
    
    newSocket.on('reconnect_failed', () => {
      console.log('Reconnection failed');
      setReconnecting(false);
      showError('Failed to reconnect to server. Please refresh the page.', { 
        autoHide: false 
      });
    });
    
    newSocket.on('error', (error) => {
      console.error('Server error:', error);
      showError(error.message || 'An error occurred');
    });
    
    newSocket.on('joined', (userData) => {
      console.log('Joined successfully:', userData);
      setUser(userData);
      setIsJoining(false);
      showSuccess(`Welcome to the chat, ${userData.username}!`);
    });
    
    setSocket(newSocket);
    
    return () => {
      console.log('Cleaning up socket connection...');
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.disconnect();
      }
    };
  }, []); 

  const handleJoin = (username) => {
    if (!socket) {
      showError('No connection to server. Please refresh the page.');
      return;
    }
    
    if (!isConnected) {
      showError('Not connected to server. Please wait for connection to be established.');
      return;
    }
    
    setIsJoining(true);
    console.log('Attempting to join with username:', username);
    socket.emit('join', username);
  };

  const handleLogout = () => {
    console.log('Logging out user:', user?.username);
    setUser(null);
  };

  const showAlert = (message, severity = 'info') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };
  
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  return (
    <ErrorBoundary showErrorDetails={process.env.NODE_ENV === 'development'}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {user ? (
          <ChatRoom 
            username={user.username}
            socket={socket}
            onLogout={handleLogout}
          />
        ) : (
          <Login 
            onJoin={handleJoin}
            loading={isJoining || !isConnected}
          />
        )}
        
        <NetworkStatus 
          isConnected={isConnected} 
          reconnecting={reconnecting} 
        />
        
        <Snackbar
          open={alert.open}
          autoHideDuration={4000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity={alert.severity} 
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </MuiThemeProvider>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ThemeProvider>
      <FeedbackProvider>
        <AppWithTheme />
        <FeedbackSnackbar />
      </FeedbackProvider>
    </ThemeProvider>
  );
}

export default App;