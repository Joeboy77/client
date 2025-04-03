import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  Modal,
  Button,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { saveAs } from 'file-saver';

const FileMessage = ({ fileUrl, fileName, fileType, fileSize, isImage, caption }) => {
  const [imageError, setImageError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const getFullFileUrl = (url) => {
    if (url.startsWith('http')) return url;
    
    return `http://localhost:8080${url}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (fileType?.startsWith('image/')) return <ImageIcon color="primary" />;
    if (fileType === 'application/pdf') return <PictureAsPdfIcon color="error" />;
    if (fileType?.includes('word') || fileType?.includes('document')) return <DescriptionIcon color="primary" />;
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet') || fileType?.includes('csv')) 
      return <TableChartIcon color="success" />;
    return <InsertDriveFileIcon color="action" />;
  };

  const handleDownload = () => {
    const fullUrl = getFullFileUrl(fileUrl);
    saveAs(fullUrl, fileName);
  };

  const handleOpenPreview = () => {
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isViewable = isImage || fileType === 'application/pdf' || fileType?.includes('text/');
  
  const handleOpenInNewTab = () => {
    window.open(getFullFileUrl(fileUrl), '_blank');
  };

  return (
    <Box sx={{ width: '100%' }}>
      {isImage && !imageError ? (
        <Box sx={{ mb: 1 }}>
          <Box 
            component="img"
            src={getFullFileUrl(fileUrl)}
            alt={fileName || 'Image'}
            onError={handleImageError}
            onClick={handleOpenPreview}
            sx={{
              maxWidth: '100%',
              maxHeight: 300,
              borderRadius: 1,
              display: 'block',
              cursor: 'pointer',
            }}
          />
          {caption && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {caption}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Tooltip title="Download">
              <IconButton edge="end" onClick={handleDownload} size="small">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            borderRadius: 1, 
            display: 'flex', 
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Box sx={{ mr: 2 }}>{getFileIcon()}</Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap title={fileName}>
              {fileName || 'File'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(fileSize)}
            </Typography>
            {caption && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {caption}
              </Typography>
            )}
          </Box>
          <Box>
            {isViewable && (
              <Tooltip title="View">
                <IconButton edge="end" onClick={handleOpenPreview} size="small" sx={{ mr: 1 }}>
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Download">
              <IconButton edge="end" onClick={handleDownload} size="small">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      )}
      
      <Modal
        open={previewOpen}
        onClose={handleClosePreview}
        aria-labelledby="file-preview-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          maxWidth: '90vw', 
          maxHeight: '90vh', 
          outline: 'none',
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 24,
          p: isImage ? 0 : 2,
          overflow: 'hidden'
        }}>
          <IconButton
            onClick={handleClosePreview}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {isImage ? (
            <img
              src={getFullFileUrl(fileUrl)}
              alt={fileName || 'Image'}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          ) : fileType === 'application/pdf' ? (
            <Box sx={{ width: '90vw', height: '90vh' }}>
              <iframe
                src={`${getFullFileUrl(fileUrl)}#view=FitH`}
                title={fileName || 'PDF Document'}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {fileName || 'File'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This file type cannot be previewed directly.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<DownloadIcon />} 
                  onClick={handleDownload}
                  sx={{ mr: 2 }}
                >
                  Download
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<OpenInNewIcon />} 
                  onClick={handleOpenInNewTab}
                >
                  Open in New Tab
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default FileMessage;