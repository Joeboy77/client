import React, { useState } from 'react';
import { Box, Button, Tooltip, Badge, ClickAwayListener, Paper } from '@mui/material';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import EmojiPicker from './EmojiPicker';

const DEFAULT_REACTIONS = [
  { emoji: '👍', name: '+1', label: 'Thumbs Up' },
  { emoji: '❤️', name: 'heart', label: 'Heart' },
  { emoji: '😂', name: 'joy', label: 'Laugh' },
  { emoji: '😮', name: 'open_mouth', label: 'Wow' },
  { emoji: '😢', name: 'cry', label: 'Sad' }
];

const EmojiReactions = ({ 
  messageId, 
  reactions = [], 
  username, 
  onAddReaction,
  readOnly = false
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        count: 0,
        users: [],
        emoji: reaction.emoji
      };
    }
    acc[reaction.emoji].count += 1;
    acc[reaction.emoji].users.push(reaction.username);
    return acc;
  }, {});
  
  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
  };
  
  const handleEmojiSelect = (emoji) => {
    if (onAddReaction) {
      onAddReaction(messageId, emoji.native);
    }
  };
  
  const handleQuickReaction = (emoji) => {
    if (onAddReaction) {
      onAddReaction(messageId, emoji);
    }
  };
  
  const hasReacted = (emoji) => {
    return groupedReactions[emoji]?.users.includes(username);
  };
  
  const getReactionTooltip = (reaction) => {
    const { users, count } = reaction;
    if (count === 1) {
      return users[0];
    }
    if (count === 2) {
      return `${users[0]} and ${users[1]}`;
    }
    return `${users[0]}, ${users[1]} and ${count - 2} others`;
  };
  
  return (
    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {Object.values(groupedReactions).map((reaction) => (
        <Tooltip 
          key={reaction.emoji} 
          title={getReactionTooltip(reaction)}
          arrow
        >
          <Badge
            badgeContent={reaction.count}
            color="primary"
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Button
              size="small"
              variant={hasReacted(reaction.emoji) ? "contained" : "outlined"}
              onClick={() => handleQuickReaction(reaction.emoji)}
              disabled={readOnly}
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                borderRadius: 4,
                fontSize: '1rem',
                lineHeight: 1,
              }}
            >
              {reaction.emoji}
            </Button>
          </Badge>
        </Tooltip>
      ))}
      
      {!readOnly && Object.keys(groupedReactions).length === 0 && (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {DEFAULT_REACTIONS.map((reaction) => (
            <Button
              key={reaction.name}
              size="small"
              variant="text"
              onClick={() => handleQuickReaction(reaction.emoji)}
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                borderRadius: 4,
                fontSize: '1rem',
                lineHeight: 1,
              }}
            >
              {reaction.emoji}
            </Button>
          ))}
        </Box>
      )}
      
      {!readOnly && (
        <>
          <Button
            size="small"
            variant="text"
            onClick={handleToggleEmojiPicker}
            sx={{
              minWidth: 'auto',
              px: 1,
              py: 0.5,
              borderRadius: 4,
              ml: Object.keys(groupedReactions).length === 0 ? 1 : 0
            }}
          >
            <AddReactionIcon fontSize="small" />
          </Button>
          
          {showEmojiPicker && (
            <EmojiPicker 
              onEmojiSelect={handleEmojiSelect} 
              onClose={handleCloseEmojiPicker}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default EmojiReactions;