import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const ReplyMessage = ({ parentMessage, onClick }) => {
  if (!parentMessage) return null;
  
  const getMessagePreview = () => {
    const maxLength = 30;
    
    if (parentMessage.type === 'audio') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AudiotrackIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            Voice message
          </Typography>
        </Box>
      );
    }
    
    if (parentMessage.type === 'file') {
      if (parentMessage.is_image) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ImageIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {parentMessage.file_name || 'Image'}
            </Typography>
          </Box>
        );
      }
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InsertDriveFileIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {parentMessage.file_name || 'File'}
          </Typography>
        </Box>
      );
    }
    
    let content = parentMessage.content || '';
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }
    
    return (
      <Typography variant="body2" color="text.secondary" noWrap>
        {content}
      </Typography>
    );
  };

  return (
    <Paper 
      variant="outlined"
      sx={{ 
        p: 1, 
        mt: -1, 
        mb: 1, 
        borderRadius: 1,
        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        display: 'flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <ReplyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="caption" fontWeight="bold" color="primary">
          {parentMessage.username}
        </Typography>
        {getMessagePreview()}
      </Box>
    </Paper>
  );
};

export default ReplyMessage;