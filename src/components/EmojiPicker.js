import React, { useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Box, ClickAwayListener, Paper } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const pickerRef = useRef(null);
  const { darkMode } = useTheme();
  
  useEffect(() => {
    if (pickerRef.current) {
      pickerRef.current.focus();
    }
  }, []);

  const handleClickAway = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleEmojiSelect = (emoji) => {
    if (onEmojiSelect) {
      onEmojiSelect(emoji);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Paper
        elevation={3}
        ref={pickerRef}
        sx={{
          position: 'absolute',
          bottom: 80,
          right: 16,
          zIndex: 1200,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 1 }}>
          <Picker 
            data={data} 
            onEmojiSelect={handleEmojiSelect}
            theme={darkMode ? 'dark' : 'light'}
            previewPosition="none"
            skinTonePosition="none"
            maxFrequentRows={0}
          />
        </Box>
      </Paper>
    </ClickAwayListener>
  );
};

export default EmojiPicker;