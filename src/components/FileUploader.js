import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  Paper,
  LinearProgress,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import axios from 'axios';

const FileUploader = ({ onSend, onCancel }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    
    setFile(selectedFile);
    
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
    
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('http://localhost:8080/api/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });
      
      onSend({
        fileUrl: response.data.fileUrl,
        fileName: response.data.filename,
        fileType: response.data.fileType,
        fileSize: response.data.fileSize,
        isImage: response.data.isImage,
        caption: caption.trim()
      });
      
      setFile(null);
      setPreview(null);
      setCaption('');
      setUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.message || 'Failed to upload file. Please try again.');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setError('');
    if (onCancel) onCancel();
  };

  const handleSelectFile = () => {
    fileInputRef.current.click();
  };

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {!file ? (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<AttachFileIcon />}
              onClick={handleSelectFile}
              sx={{ mb: 1 }}
            >
              Select File
            </Button>
            <Typography variant="caption" color="text.secondary">
              Supported file types: Images, PDF, DOC, XLSX, TXT (Max: 10MB)
            </Typography>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {preview ? (
                  <ImageIcon color="primary" sx={{ mr: 1 }} />
                ) : (
                  <InsertDriveFileIcon color="primary" sx={{ mr: 1 }} />
                )}
                <Box>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCancel} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {preview && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: 4,
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a caption (optional)"
              size="small"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              sx={{ mb: 2 }}
            />

            {uploading && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                  Uploading: {uploadProgress}%
                </Typography>
              </Box>
            )}

            {error && (
              <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              onClick={handleUpload}
              disabled={uploading}
              fullWidth
            >
              {uploading ? 'Uploading...' : 'Send File'}
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default FileUploader;