import React, { createContext, useState, useContext } from 'react';

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'info', 
    autoHide: true,
    duration: 4000,
  });

  const showFeedback = (message, options = {}) => {
    setFeedback({
      open: true,
      message,
      severity: options.severity || 'info',
      autoHide: options.autoHide !== undefined ? options.autoHide : true,
      duration: options.duration || 4000,
    });
  };

  const hideFeedback = () => {
    setFeedback(prev => ({
      ...prev,
      open: false,
    }));
  };

  const showError = (message, options = {}) => 
    showFeedback(message, { ...options, severity: 'error' });
  
  const showSuccess = (message, options = {}) => 
    showFeedback(message, { ...options, severity: 'success' });
  
  const showWarning = (message, options = {}) => 
    showFeedback(message, { ...options, severity: 'warning' });
  
  const showInfo = (message, options = {}) => 
    showFeedback(message, { ...options, severity: 'info' });

  return (
    <FeedbackContext.Provider 
      value={{ 
        feedback, 
        showFeedback, 
        hideFeedback,
        showError,
        showSuccess,
        showWarning,
        showInfo
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export default FeedbackContext;