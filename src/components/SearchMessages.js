import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Typography,
  Chip,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { format } from 'date-fns';

const SearchMessages = ({ messages, onSearchResultClick }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = messages
      .filter(msg => !msg.is_deleted && !msg.is_temp) 
      .filter(
        msg => 
          msg.content.toLowerCase().includes(query) || 
          msg.username.toLowerCase().includes(query)
      )
      .map(msg => ({
        id: msg.id,
        content: msg.content,
        username: msg.username,
        created_at: msg.created_at,
        matched: 
          msg.content.toLowerCase().includes(query) ? 'content' : 'username'
      }));
    
    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, messages]);
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchQuery('');
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const handlePrevResult = () => {
    if (searchResults.length === 0) return;
    
    const newIndex = currentResultIndex > 0 
      ? currentResultIndex - 1 
      : searchResults.length - 1;
      
    setCurrentResultIndex(newIndex);
    
    if (onSearchResultClick) {
      onSearchResultClick(searchResults[newIndex].id);
    }
  };
  
  const handleNextResult = () => {
    if (searchResults.length === 0) return;
    
    const newIndex = currentResultIndex < searchResults.length - 1 
      ? currentResultIndex + 1 
      : 0;
      
    setCurrentResultIndex(newIndex);
    
    if (onSearchResultClick) {
      onSearchResultClick(searchResults[newIndex].id);
    }
  };
  
  const handleResultClick = (index) => {
    setCurrentResultIndex(index);
    
    if (onSearchResultClick) {
      onSearchResultClick(searchResults[index].id);
    }
  };
  
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <span style={{ backgroundColor: '#ffff00', color: '#000000' }}>
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    );
  };
  
  return (
    <>
      <IconButton onClick={toggleSearch} color="inherit" aria-label="search messages">
        <SearchIcon />
      </IconButton>
      
      <Collapse in={searchOpen} sx={{ position: 'absolute', top: 64, right: 0, left: 0, zIndex: 10 }}>
        <Paper sx={{ p: 2, borderRadius: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search messages or users..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      onClick={handleClearSearch}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <IconButton 
                onClick={handlePrevResult} 
                disabled={searchResults.length === 0}
                size="small"
              >
                <KeyboardArrowUpIcon />
              </IconButton>
              
              <IconButton 
                onClick={handleNextResult} 
                disabled={searchResults.length === 0}
                size="small"
              >
                <KeyboardArrowDownIcon />
              </IconButton>
              
              <Typography variant="body2" sx={{ mx: 1, color: 'text.secondary' }}>
                {searchResults.length > 0 
                  ? `${currentResultIndex + 1}/${searchResults.length}` 
                  : '0/0'}
              </Typography>
              
              <IconButton onClick={toggleSearch} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          
          {searchResults.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
              </Typography>
              
              <List dense sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {searchResults.map((result, index) => (
                  <ListItem
                    key={result.id}
                    button
                    selected={index === currentResultIndex}
                    onClick={() => handleResultClick(index)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {result.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {format(new Date(result.created_at), 'MMM d, yyyy h:mm a')}
                          </Typography>
                          <Chip 
                            label={result.matched === 'username' ? 'User' : 'Message'} 
                            size="small" 
                            color={result.matched === 'username' ? 'primary' : 'secondary'}
                            variant="outlined"
                            sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        result.matched === 'content' 
                          ? highlightMatch(result.content, searchQuery)
                          : result.content
                      }
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: 'body2',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          {searchQuery && searchResults.length === 0 && (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No messages found matching "{searchQuery}"
              </Typography>
            </Box>
          )}
        </Paper>
      </Collapse>
    </>
  );
};

export default SearchMessages;