import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  ListItem,
  IconButton,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import EmojiReactions from './EmojiReactions';
import AudioMessage from './AudioMessage';
import FileMessage from './FileMessage';
import ReplyIcon from '@mui/icons-material/Reply';
import ReplyMessage from './ReplyMessage';

const MessageItem = ({ 
  message, 
  isOwnMessage, 
  onEdit, 
  username,
  onDelete,
  isGrouped = false,
  isFirstInGroup = false,
  isLastInGroup = false,
  isTemp = false,
  highlightedMessageId = null,
  onAddReaction,
  onReply,
  onScrollToMessage, 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  
  const openMenu = Boolean(anchorEl);
  
  const formattedTime = format(new Date(message.created_at), 'h:mm a');
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    handleCloseMenu();
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
    handleCloseMenu();
  };

  const handleParentClick = () => {
    if (message.parentMessage && onScrollToMessage) {
      onScrollToMessage(message.parentMessage.id);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };
  
  const handleSaveEdit = () => {
    if (editedContent.trim() !== '') {
      onEdit(message.id, editedContent);
      setIsEditing(false);
    }
  };
  
  const handleDelete = () => {
    onDelete(message.id);
    handleCloseMenu();
  };
  
  if (message.is_deleted) {
    return (
      <ListItem
        sx={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          px: 1,
          py: 0.5,
        }}
      >
        <Paper
          sx={{
            p: 2,
            maxWidth: '70%',
            bgcolor: '#f1f1f1',
            borderRadius: 2,
            opacity: 0.7,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            This message has been deleted
          </Typography>
        </Paper>
      </ListItem>
    );
  }
  
  return (
    <ListItem
      id={`message-${message.id}`}
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        px: 1,
        py: isGrouped ? 0.25 : 0.5, 
        pt: isFirstInGroup ? 0 : 0.25, 
        pb: isLastInGroup ? 0.5 : 0.25, 
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '70%',
          borderRadius: isGrouped ? 
            (isFirstInGroup && isLastInGroup) ? 2 : 
            (isFirstInGroup ? '16px 16px 4px 16px' : 
            (isLastInGroup ? '4px 4px 16px 16px' : '4px')) : 
            2,
            bgcolor: theme => {
              if (message.id === highlightedMessageId) return theme.palette.mode === 'dark' ? '#4a4a1f' : '#ffffc7';
              if (isTemp) return theme.palette.mode === 'dark' ? 'rgba(66, 165, 245, 0.3)' : 'rgba(41, 121, 255, 0.1)';
              return isOwnMessage ? 
                theme.palette.primary.light : 
                theme.palette.background.paper;
            },
            color: theme => {
              if (message.id === highlightedMessageId) return theme.palette.text.primary;
              if (isTemp) return theme.palette.text.primary;
              return isOwnMessage ? 
                theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white' : 
                theme.palette.text.primary;
            },
            position: 'relative',
            opacity: isTemp ? 0.8 : 1,
            transition: 'background-color 0.3s ease',
        }}
      >
        {isEditing ? (
            <Box sx={{ mt: 1 }}>
            </Box>
          ) : (
            <>
              {message.parentMessage && (
                <ReplyMessage 
                  parentMessage={message.parentMessage} 
                  onClick={handleParentClick}
                />
              )}
              {message.type === 'audio' ? (
                <AudioMessage 
                  audioUrl={message.audio_url} 
                  duration={message.audio_duration} 
                />
              ) : message.type === 'file' ? (
                <FileMessage 
                  fileUrl={message.file_url}
                  fileName={message.file_name}
                  fileType={message.file_type}
                  fileSize={message.file_size}
                  isImage={message.is_image}
                  caption={message.content !== 'File shared' ? message.content : ''}
                />
              ) : (
                <Typography variant="body1">
                  {message.content}
                </Typography>
              )}

              {message.reactions && message.reactions.length > 0 && (
                <EmojiReactions
                  messageId={message.id}
                  reactions={message.reactions}
                  username={username}
                  onAddReaction={onAddReaction}
                  readOnly={isTemp || message.is_deleted}
                />
              )}
            </>
          )}
        {(isLastInGroup || !isGrouped) && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 1 
          }}>
            <Box>
              <Typography variant="caption" color={isOwnMessage ? 'rgba(255,255,255,0.8)' : 'text.secondary'}>
                {formattedTime}
              </Typography>
              
              {message.is_edited && (
                <Typography variant="caption" color={isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ ml: 1 }}>
                  (edited)
                </Typography>
              )}
            </Box>
            
            {isOwnMessage && !isEditing && (
              <Box>
                <IconButton
                  size="small"
                  onClick={handleOpenMenu}
                  sx={{ color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleCloseMenu}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={handleReply}>
                  <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
                  Reply
                </MenuItem>
                  <MenuItem onClick={handleEdit}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Edit
                  </MenuItem>
                  <MenuItem onClick={handleDelete}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </ListItem>
  );
};

export default MessageItem;