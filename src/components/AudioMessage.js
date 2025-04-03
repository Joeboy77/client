import React, { useRef, useState, useEffect } from 'react';
import { Box, IconButton, LinearProgress, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const AudioMessage = ({ audioUrl, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getFullAudioUrl = (url) => {
    if (url.startsWith('http')) return url;
    
    return `http://localhost:8080${url}`;
  };

  useEffect(() => {
    const fullAudioUrl = getFullAudioUrl(audioUrl);
    console.log('Loading audio from:', fullAudioUrl);
    
    const audio = new Audio(fullAudioUrl);
    audioRef.current = audio;
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });
    
    audio.addEventListener('timeupdate', () => {
      const currentProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setAudioError(true);
    });
    
    return () => {
      audio.pause();
      audio.remove();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioError) {
      const fullAudioUrl = getFullAudioUrl(audioUrl);
      audioRef.current = new Audio(fullAudioUrl);
      setAudioError(false);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setAudioError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton 
          onClick={togglePlay} 
          sx={{ 
            color: 'primary.main', 
            bgcolor: 'primary.light', 
            mr: 1,
            '&:hover': { bgcolor: 'primary.main', color: 'white' } 
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ width: '100%', height: 4, borderRadius: 1 }} 
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {audioError ? "Error loading audio" : formatTime(duration || 0)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AudioMessage;