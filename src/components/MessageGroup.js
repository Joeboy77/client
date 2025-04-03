import React from 'react';
import { Box, Typography, Avatar, ListItem } from '@mui/material';
import { format } from 'date-fns';
import MessageItem from './MessageItem';

const MessageGroup = ({ messages, isOwnMessage, onEdit, onDelete, highlightedMessageId, onAddReaction, onScrollToMessage, onReply, username }) => {
  const senderUsername = messages[0].username;
  
  const formattedDate = format(new Date(messages[0].created_at), 'MMM d, yyyy');
  
  return (
    <Box sx={{ mb: 2 }}>
      {messages[0].showDate && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            my: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 0.5,
              bgcolor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 5,
              color: 'text.secondary',
            }}
          >
            {formattedDate}
          </Typography>
        </Box>
      )}
      
      <ListItem
        sx={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          pb: 0,
          pt: 0.5,
        }}
        disableGutters
      >
        {!isOwnMessage && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mb: 1 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                mr: 1,
              }}
            >
              {senderUsername.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="subtitle2" color="text.secondary">
              {senderUsername}
            </Typography>
          </Box>
        )}
      </ListItem>
      
      <Box>
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            isGrouped={true}
            isFirstInGroup={index === 0}
            isLastInGroup={index === messages.length - 1}
            onEdit={onEdit}
            onDelete={onDelete}
            highlightedMessageId={highlightedMessageId}
            onAddReaction={onAddReaction}
            username={username}
            onScrollToMessage={onScrollToMessage}
            onReply={onReply}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MessageGroup;