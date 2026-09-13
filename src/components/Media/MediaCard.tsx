import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import MaterialSymbol from '../shared/MaterialSymbol';

const getFileIcon = (fileName: string, mediaType: string, size: number, weight: any = 'regular', color?: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const fill = weight === 'fill';
  if (ext === 'pdf') return <MaterialSymbol icon="picture_as_pdf" size={size} fill={fill} color={color} />;
  if (['doc', 'docx'].includes(ext)) return <MaterialSymbol icon="description" size={size} fill={fill} color={color} />;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return <MaterialSymbol icon="table_chart" size={size} fill={fill} color={color} />;
  if (['ppt', 'pptx'].includes(ext)) return <MaterialSymbol icon="slideshow" size={size} fill={fill} color={color} />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <MaterialSymbol icon="folder_zip" size={size} fill={fill} color={color} />;
  if (mediaType === 'videos' || ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) return <MaterialSymbol icon="videocam" size={size} fill={fill} color={color} />;
  if (mediaType === 'audio' || ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return <MaterialSymbol icon="headphones" size={size} fill={fill} color={color} />;
  if (mediaType === 'images' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return <MaterialSymbol icon="image" size={size} fill={fill} color={color} />;
  return <MaterialSymbol icon="description" size={size} fill={fill} color={color} />;
};
import { useI18n } from '../../i18n/I18nContext';
import { k } from '../../i18n/k';
import { useIsDark } from '../shared/hooks';
import PdfThumbnail from './PdfThumbnail';
import { getMediaUrl, getThumbUrl, isImageFile, isPdfFile, isOfficeFile, handleOpenSystem } from './mediaUtils';

export default React.memo(function MediaCard({ item }: { item: any }) {
  const formatSize = (bytes: number) => {
    if (!bytes) return t(k.MEDIA_UNKNOWN_SIZE);
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(0) + ' KB';
    const mb = kb / 1024;
    if (mb < 1024) return mb.toFixed(1) + ' MB';
    return (mb / 1024).toFixed(2) + ' GB';
  };

  const isDark = useIsDark();
  const { t } = useI18n();

  const isImage = isImageFile(item.fileName) || item.mediaType === 'images';
  const isPdf = isPdfFile(item.fileName);
  const isOffice = isOfficeFile(item.fileName);

  return (
    <Box
      sx={{
        width: '100%', 
        borderRadius: '24px', overflow: 'hidden', position: 'relative',
        display: 'flex', flexDirection: 'column',
        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
        boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
        transition: 'background-color 0.2s',
        contentVisibility: 'auto',
        containIntrinsicSize: '280px 240px',
      }}
    >
      {/* Thumbnail Area with Zero-Repaint Static Placeholder */}
      <Box
        sx={{
          width: '100%', aspectRatio: '16/9', height: 'auto', cursor: 'pointer', position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden'
        }}
        onClick={() => handleOpenSystem(item.filePath)}
      >
        {/* Static, lightweight placeholder icon (0 repaints/sec) */}
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, pointerEvents: 'none' }}>
          {getFileIcon(item.fileName, item.mediaType, 40, 'regular', isDark ? '#aaa' : '#666')}
        </Box>

        {isImage ? (
          <img 
            src={getThumbUrl(item)} 
            alt={item.fileName} 
            loading="lazy" 
            decoding="async"
            onLoad={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            style={{ 
              width: '100%', height: '100%', objectFit: 'cover', 
              opacity: 0, transition: 'opacity 0.2s ease-out', 
              zIndex: 2, position: 'absolute', top: 0, left: 0 
            }} 
          />
        ) : isPdf ? (
          <Box sx={{ width: '100%', height: '100%', zIndex: 2, position: 'absolute', top: 0, left: 0 }}>
            <PdfThumbnail fileUrl={getMediaUrl(item)} fileName={item.fileName} />
          </Box>
        ) : isOffice ? (
          <img
            src={`nammil://media/${encodeURIComponent(item.filePath + '_thumb.jpeg')}`}
            loading="lazy"
            decoding="async"
            onLoad={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            style={{ 
              width: '100%', height: '100%', objectFit: 'cover', 
              opacity: 0, transition: 'opacity 0.2s ease-out', 
              zIndex: 2, position: 'absolute', top: 0, left: 0 
            }}
          />
        ) : null}
      </Box>

      {/* File Info Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, gap: 1.5, flex: 1 }}>
        <Box sx={{
          minWidth: 36, height: 36, borderRadius: '50%',
          bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#fff' : '#000'
        }}>
          {getFileIcon(item.fileName, item.mediaType, 18, 'fill')}
        </Box>
        <Box sx={{ overflow: 'hidden', flex: 1 }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isDark ? '#fff' : '#000' }} title={item.fileName}>
            {item.fileName}
          </Typography>
          <Typography sx={{ fontSize: '11px', color: isDark ? '#999' : '#666', mt: 0.5 }}>
            {item.fileName.split('.').pop()?.toUpperCase()} • {formatSize(item.fileSize)}
          </Typography>
        </Box>
      </Box>

      {/* Action Footer */}
      <Box sx={{ display: 'flex', gap: 1, px: 2, pb: 2, pt: 0 }}>
        <Button
          fullWidth size="small"
          sx={{ 
            color: isDark ? '#fff' : '#000', fontSize: '12px', fontWeight: 600, textTransform: 'none', py: 1, 
            borderRadius: '500px', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } 
          }}
          onClick={() => handleOpenSystem(item.filePath)}
        >
          {t(k.MEDIA_VIEW)}
        </Button>
        <Button
          fullWidth size="small"
          sx={{ 
            color: isDark ? '#fff' : '#000', fontSize: '12px', fontWeight: 600, textTransform: 'none', py: 1, 
            borderRadius: '500px', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } 
          }}
          onClick={() => (window as any).electronAPI?.showInFolder(item.filePath)}
        >
          {t(k.MEDIA_SHOW_FILE)}
        </Button>
      </Box>
    </Box>
  );
});
