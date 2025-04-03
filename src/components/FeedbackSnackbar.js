import React from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useFeedback } from '../contexts/FeedbackContext';

const FeedbackSnackbar = () => {
  const { feedback, hideFeedback } = useFeedback();
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway' && feedback.autoHide === false) {
      return;
    }
    hideFeedback();
  };

  return (
    <Snackbar
      open={feedback.open}
      autoHideDuration={feedback.autoHide ? feedback.duration : null}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={feedback.severity} 
        sx={{ width: '100%' }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {feedback.message}
      </Alert>
    </Snackbar>
  );
};

export default FeedbackSnackbar;