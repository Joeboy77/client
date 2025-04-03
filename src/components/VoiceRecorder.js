import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  LinearProgress,
  Paper,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import MicRecorder from 'mic-recorder-to-mp3';

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    recorderRef.current = new MicRecorder({ bitRate: 128 });
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      await recorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error.name === 'NotAllowedError') {
        alert('Microphone permission is required to record audio.');
      } else {
        alert('Error starting recording. Please try again.');
      }
    }
  };

  const stopRecording = async () => {
    try {
      const [buffer, blob] = await recorderRef.current.stop().getMp3();
      
      const audioUrl = URL.createObjectURL(blob);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setIsRecording(false);
      setAudioBlob(blob);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('Error saving recording. Please try again.');
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (isRecording) {
      recorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setIsRecording(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    
    if (onCancel) {
      onCancel();
    }
  };

  const sendRecording = () => {
    if (audioBlob && onSend) {
      onSend(audioBlob, recordingTime);
      
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {isRecording ? 'Recording...' : audioBlob ? 'Recording complete' : 'Ready to record'}
        </Typography>
        
        <Typography variant="h5" sx={{ fontFamily: 'monospace', my: 1 }}>
          {formatTime(recordingTime)}
        </Typography>
        
        {isRecording && (
          <LinearProgress 
            variant="determinate" 
            value={(recordingTime % 60) * (100/60)} 
            sx={{ width: '100%', mb: 2 }} 
            color="error" 
          />
        )}
        
        {audioUrl && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <audio src={audioUrl} controls style={{ width: '100%' }} />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          {!isRecording && !audioBlob && (
            <IconButton 
              onClick={startRecording} 
              color="primary" 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                p: 2
              }}
            >
              <MicIcon />
            </IconButton>
          )}
          
          {isRecording && (
            <IconButton 
              onClick={stopRecording} 
              color="error" 
              sx={{ 
                bgcolor: 'error.main', 
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' },
                p: 2
              }}
            >
              <StopIcon />
            </IconButton>
          )}
          
          {audioBlob && (
            <>
              <IconButton 
                onClick={sendRecording} 
                color="primary" 
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  p: 2
                }}
              >
                <SendIcon />
              </IconButton>
            </>
          )}
          
          <IconButton 
            onClick={cancelRecording}
            sx={{ p: 2 }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default VoiceRecorder;