import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Divider,
  CircularProgress,
  List,
  Grid,
  Badge,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import MessageItem from './MessageItem';
import UsersList from './UsersList';
import ChatNotification from './ChatNotification';
import MessageGroup from './MessageGroup';
import TypingIndicator from './TypingIndicator';
import ThemeToggle from './ThemeToggle';
import { useFeedback } from '../contexts/FeedbackContext';
import SearchMessages from './SearchMessages';
import EmojiPicker from './EmojiPicker';
import EmojiRegex from 'emoji-regex'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import VoiceRecorder from './VoiceRecorder';
import AudioMessage from './AudioMessage';
import MicIcon from '@mui/icons-material/Mic';
import axios from 'axios'
import FileUploader from './FileUploader';
import FileMessage from './FileMessage';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';


const ChatRoom = ({ username, socket, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);






  const { showError, showSuccess, showInfo } = useFeedback();

  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('messageHistory', (history) => {
      console.log('Received message history:', history.length);
      setMessages(history);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    });
    
    socket.on('newMessage', (message) => {
        console.log('Received new message:', message);
        
        setMessages((prevMessages) => {
          const filteredMessages = prevMessages.filter(msg => 
            !(msg.is_temp && msg.content === message.content)
          );
          
          return [...filteredMessages, message];
        });
        
        setTimeout(scrollToBottom, 100);
      });
    
    socket.on('messageUpdated', (updatedMessage) => {
      console.log('Message updated:', updatedMessage);
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message
        )
      );
    });
    
    socket.on('messageDeleted', (deletedMessage) => {
      console.log('Message deleted:', deletedMessage);
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === deletedMessage.id ? deletedMessage : message
        )
      );
    });
    
    socket.on('activeUsers', (users) => {
      console.log('Active users:', users);
      setActiveUsers(users);
    });
    
    socket.on('userJoined', (userData) => {
      console.log('User joined:', userData);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'join',
          username: userData.username,
          timestamp: userData.timestamp
        }
      ]);
    });
    
    socket.on('userLeft', (userData) => {
      console.log('User left:', userData);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'leave',
          username: userData.username,
          timestamp: userData.timestamp
        }
      ]);
    });
    
    socket.on('userTyping', (typingUser) => {
      console.log('User typing:', typingUser);
      setTypingUsers((prevTypingUsers) => {
        if (prevTypingUsers.some((user) => user.id === typingUser.id)) {
          return prevTypingUsers;
        }
        return [...prevTypingUsers, typingUser];
      });
    });
    
    socket.on('userStoppedTyping', (stoppedUser) => {
      console.log('User stopped typing:', stoppedUser);
      setTypingUsers((prevTypingUsers) => 
        prevTypingUsers.filter((user) => user.id !== stoppedUser.id)
      );
    });
    
    socket.on('error', (error) => {
      console.error('Error from server:', error);
      setError(error.message);
      setLoading(false);
    });
    
    return () => {
      socket.off('messageHistory');
      socket.off('newMessage');
      socket.off('messageUpdated');
      socket.off('messageDeleted');
      socket.off('activeUsers');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('error');
    };
  }, [socket]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('error', (error) => {
      console.error('Error from server:', error);
      showError(error.message || 'An error occurred');
      setLoading(false);
    });
    
  }, [socket, showError]);

  useEffect(() => {
    if (!socket) return;
    
    const handleMessageReaction = (reaction) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id !== reaction.messageId) return msg;
          
          const updatedReactions = [...(msg.reactions || [])];
          
          if (reaction.removed) {
            const index = updatedReactions.findIndex(
              r => r.emoji === reaction.emoji && r.username === reaction.username
            );
            if (index !== -1) {
              updatedReactions.splice(index, 1);
            }
          } else {
            updatedReactions.push({
              emoji: reaction.emoji,
              username: reaction.username,
              message_id: reaction.messageId
            });
          }
          
          return { ...msg, reactions: updatedReactions };
        })
      );
    };
    
    socket.on('messageReaction', handleMessageReaction);
    
    return () => {
      socket.off('messageReaction', handleMessageReaction);
    };
  }, [socket]);
  
  const handleSendMessage = (e) => {
    e?.preventDefault();
    
    if (!messageText.trim()) return;
    
    console.log('Sending message:', messageText);

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      content: messageText,
      username,
      created_at: new Date().toISOString(),
      is_temp: true
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setMessageText('');
    
    if (isTyping) {
      setIsTyping(false);
      socket.emit('stoppedTyping');
    }

    socket.timeout(5000).emit('sendMessage', { content: messageText }, (err) => {
        if (err) {
          setMessages((prevMessages) => 
            prevMessages.filter(msg => msg.id !== tempId)
          );
          showError(`Failed to send message: ${err.message || 'Unknown error'}`);
        }
      });
  };
  
  const handleEditMessage = (messageId, newContent) => {
    console.log('Editing message:', messageId, newContent);

    socket.timeout(5000).emit('editMessage', { messageId, content: newContent }, (err) => {
        if (err) {
          showError(`Failed to edit message: ${err.message || 'Unknown error'}`);
        } else {
          showSuccess('Message updated');
        }
      });
  };
  
  const handleDeleteMessage = (messageId) => {
    console.log('Deleting message:', messageId);
    
    socket.timeout(5000).emit('deleteMessage', { messageId }, (err) => {
        if (err) {
          showError(`Failed to delete message: ${err.message || 'Unknown error'}`);
        } else {
          showInfo('Message deleted');
        }
      });
  };
  
  const handleMessageTextChange = (e) => {
    const newText = e.target.value;
    setMessageText(newText);
    
    if (newText && !isTyping) {
      setIsTyping(true);
      socket.emit('typing');
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('stoppedTyping');
      }
    }, 2000);
  };

  const handleAddReaction = (messageId, emoji) => {
    if (!socket || !socket.connected) {
      showError('Cannot add reaction - not connected to server');
      return;
    }
    
    socket.timeout(5000).emit('addReaction', { messageId, emoji }, (err) => {
      if (err) {
        showError(`Failed to add reaction: ${err.message || 'Unknown error'}`);
      }
    });
  };
  
  const handleSearchResultClick = (messageId) => {
    setHighlightedMessageId(messageId);
    
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
  };

  const handleReplyToMessage = (message) => {
    setReplyToMessage(message);
  };
  
  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  const handleScrollToMessage = (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  };

  const handleSendReplyMessage = (e) => {
    e?.preventDefault();
    
    if (!messageText.trim() || !replyToMessage) return;
    
    console.log('Sending reply message:', messageText, 'to message:', replyToMessage.id);
    
    socket.timeout(5000).emit('sendReplyMessage', {
      content: messageText,
      parentMessageId: replyToMessage.id
    }, (err) => {
      if (err) {
        showError(`Failed to send reply: ${err.message || 'Unknown error'}`);
      } else {
        setMessageText('');
        setReplyToMessage(null);
      }
    });
  };

  

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const groupMessages = (messages) => {
    if (!messages.length) return [];
    
    const groups = [];
    let currentGroup = [messages[0]];
    
    let currentDate = new Date(messages[0].created_at).toDateString();
    messages[0].showDate = true;
    
    for (let i = 1; i < messages.length; i++) {
      const currentMessage = messages[i];
      const prevMessage = messages[i - 1];
      
      const messageDate = new Date(currentMessage.created_at).toDateString();
      if (messageDate !== currentDate) {
        currentMessage.showDate = true;
        currentDate = messageDate;
      }
      
      const sameUser = currentMessage.username === prevMessage.username;
      const timeClose = (new Date(currentMessage.created_at) - new Date(prevMessage.created_at)) < 300000; 
      
      if (sameUser && timeClose && !currentMessage.showDate) {
        currentGroup.push(currentMessage);
      } else {
        groups.push(currentGroup);
        currentGroup = [currentMessage];
      }
    }
    
    groups.push(currentGroup);
    
    return groups;
  };

  const handleEmojiSelect = (emoji) => {
    setMessageText(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

const handleSendVoiceMessage = async (audioBlob, duration) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.mp3');
    formData.append('duration', duration.toString());
    
    const response = await axios.post('http://localhost:8080/api/upload/audio', formData);
    
    socket.timeout(5000).emit('sendAudioMessage', {
      audioUrl: response.data.audioUrl, 
      duration: duration
    }, (err) => {
      if (err) {
        showError(`Failed to send audio message: ${err.message || 'Unknown error'}`);
      } else {
        setShowVoiceRecorder(false);
      }
    });
  } catch (error) {
    console.error('Error sending voice message:', error);
    showError('Failed to send voice message. Please try again.');
  }
};

const handleSendFile = async (fileData) => {
  try {
    socket.timeout(10000).emit('sendFileMessage', fileData, (err) => {
      if (err) {
        showError(`Failed to send file: ${err.message || 'Unknown error'}`);
      } else {
        setShowFileUploader(false);
        showSuccess('File sent successfully');
      }
    });
  } catch (error) {
    console.error('Error sending file:', error);
    showError('Failed to send file. Please try again.');
  }
};
  
  const renderMessages = () => {
    const messagesOnly = messages.filter(msg => !msg.is_deleted);
    const deletedMessages = messages.filter(msg => msg.is_deleted);
    
    const messageGroups = groupMessages(messagesOnly);
    
    const timeline = [
      ...messageGroups.map(group => ({
        type: 'messageGroup',
        data: group,
        time: new Date(group[0].created_at).getTime(),
        id: `group-${group[0].id}`
      })),
      ...deletedMessages.map(msg => ({
        type: 'deletedMessage',
        data: msg,
        time: new Date(msg.created_at).getTime(),
        id: `deleted-${msg.id}`
      })),
      ...notifications.map(notif => ({
        type: 'notification',
        data: notif,
        time: new Date(notif.timestamp).getTime(),
        id: `notif-${notif.id}`
      }))
    ].sort((a, b) => a.time - b.time);

    const handleEmojiSelect = (emoji) => {
        setMessageText(prev => prev + emoji.native);
        setShowEmojiPicker(false);
      };
    
    return (
      <>
        {timeline.map(item => (
          <React.Fragment key={item.id}>
            {item.type === 'messageGroup' && (
              <MessageGroup
                messages={item.data}
                isOwnMessage={item.data[0].username === username}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onAddReaction={handleAddReaction}
                highlightedMessageId={highlightedMessageId}
                onReply={handleReplyToMessage}
                onScrollToMessage={handleScrollToMessage}
                username={username}
              />
            )}
            {item.type === 'deletedMessage' && (
              <MessageItem
                message={item.data}
                isOwnMessage={item.data.username === username}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onAddReaction={handleAddReaction}
                highlightedMessageId={highlightedMessageId}
                onReply={handleReplyToMessage}
                onScrollToMessage={handleScrollToMessage}
                username={username}
              />
            )}
            {item.type === 'notification' && (
              <ChatNotification notification={item.data} />
            )}
          </React.Fragment>
        ))}
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
      </>
    );
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ChatRoom
          </Typography>

          <SearchMessages 
            messages={messages}
            onSearchResultClick={handleSearchResultClick}
          />

          <ThemeToggle />
          
          {isMobile && (
            <Button 
              color="inherit" 
              onClick={toggleDrawer}
              startIcon={
                <Badge
                  badgeContent={activeUsers.length}
                  color="secondary"
                  sx={{ mr: 1 }}
                >
                  <PeopleIcon />
                </Badge>
              }
              sx={{ mr: 2 }}
            >
              Users
            </Button>
          )}
          
          <Button
            color="inherit"
            onClick={onLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ height: '100%', py: 2 }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12} md={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
              <Box 
                ref={chatContainerRef}
                sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  p: 2,
                  bgcolor: '#f9f9f9'
                }}
              >
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : error ? (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Typography color="error">{error}</Typography>
                    </Box>
                  ) : messages.length === 0 && notifications.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No messages yet. Be the first to say hello!
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {renderMessages()}
                    </List>
                  )}
                  <div ref={messagesEndRef} />
                </Box>
                
                <Divider />
                
                <Box 
                    component="form" 
                    onSubmit={replyToMessage ? handleSendReplyMessage : handleSendMessage}
                    sx={{ 
                      p: 2, 
                      bgcolor: 'background.paper',
                      display: 'flex',
                      position: 'relative',
                      flexDirection: 'column'
                    }}
                  >
                    {showVoiceRecorder ? (
                      <VoiceRecorder 
                        onSend={handleSendVoiceMessage} 
                        onCancel={() => setShowVoiceRecorder(false)} 
                      />
                    ) : showFileUploader ? (
                      <FileUploader 
                        onSend={handleSendFile} 
                        onCancel={() => setShowFileUploader(false)} 
                      />
                    ) : (
                      <>
                        {replyToMessage && (
                          <Box sx={{ mb: 2, position: 'relative' }}>
                            <Typography variant="caption" color="primary" sx={{ mb: 1, display: 'block' }}>
                              Replying to {replyToMessage.username}
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                              {replyToMessage.type === 'audio' ? (
                                <Typography variant="body2" noWrap>Voice message</Typography>
                              ) : replyToMessage.type === 'file' ? (
                                <Typography variant="body2" noWrap>
                                  {replyToMessage.file_name || (replyToMessage.is_image ? 'Image' : 'File')}
                                </Typography>
                              ) : (
                                <Typography variant="body2" noWrap>
                                  {replyToMessage.content.length > 50 
                                    ? replyToMessage.content.substring(0, 50) + '...' 
                                    : replyToMessage.content}
                                </Typography>
                              )}
                            </Paper>
                            <IconButton
                              size="small"
                              sx={{ position: 'absolute', top: 0, right: 0 }}
                              onClick={handleCancelReply}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', width: '100%' }}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            placeholder={replyToMessage ? "Type your reply..." : "Type a message..."}
                            value={messageText}
                            onChange={handleMessageTextChange}
                            onKeyPress={handleKeyPress}
                            size="medium"
                            autoComplete="off"
                            sx={{ 
                              mr: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                            InputProps={{
                              endAdornment: (
                                <>
                                  <IconButton
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    size='small'
                                    sx={{mr: 0.5}}
                                  >
                                    <InsertEmoticonIcon fontSize='small'/>
                                  </IconButton>
                                  <IconButton
                                    onClick={() => setShowFileUploader(true)}
                                    size='small'
                                    sx={{mr: 0.5}}
                                  >
                                    <AttachFileIcon fontSize='small'/>
                                  </IconButton>
                                  <IconButton
                                    onClick={() => setShowVoiceRecorder(true)}
                                    size='small'
                                    sx={{mr: -0.5}}
                                  >
                                    <MicIcon fontSize='small'/>
                                  </IconButton>
                                </>
                              )
                            }}
                          />
                          
                          <IconButton 
                            color="primary" 
                            onClick={replyToMessage ? handleSendReplyMessage : handleSendMessage} 
                            disabled={!messageText.trim()}
                            sx={{ 
                              bgcolor: 'primary.main', 
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'primary.dark',
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'action.disabledBackground',
                                color: 'action.disabled',
                              },
                              borderRadius: 2,
                            }}
                          >
                            <SendIcon />
                          </IconButton>

                          {showEmojiPicker && (
                            <EmojiPicker
                              onEmojiSelect={handleEmojiSelect}
                              onClose={() => setShowEmojiPicker(false)}
                            />
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
              </Paper>
            </Grid>
            
            {!isMobile && (
              <Grid item md={3} sx={{ height: '100%', display: { xs: 'none', md: 'block' } }}>
                <UsersList 
                  activeUsers={activeUsers} 
                  currentUser={username}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
      
      {isMobile && (
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer}
        >
          <Box sx={{ width: 250, height: '100%' }}>
            <UsersList 
              activeUsers={activeUsers} 
              currentUser={username}
            />
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default ChatRoom;