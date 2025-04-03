import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The application encountered an unexpected error. Please try refreshing the page.
            </Typography>
            <Button variant="contained" onClick={this.handleReset}>
              Reload Application
            </Button>
            
            {this.props.showErrorDetails && this.state.error && (
              <Box sx={{ mt: 4, textAlign: 'left', width: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Error details:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    overflowX: 'auto',
                  }}
                >
                  <Typography variant="caption" component="pre">
                    {this.state.error.toString()}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;