import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import MaterialSymbol from '../shared/MaterialSymbol';
import { useI18n } from '../../i18n/I18nContext';
import { k } from '../../i18n/k';
import { useIsDark } from '../shared/hooks';
import MediaCard from './MediaCard';

interface MediaGridProps {
  groupedMedia: Record<string, any[]>;
  hasMore?: boolean;
  remainingCount?: number;
  onLoadMore?: () => void;
}

export default function MediaGrid({ groupedMedia, hasMore, remainingCount = 0, onLoadMore }: MediaGridProps) {
  const { t } = useI18n();
  const isDark = useIsDark();

  if (Object.keys(groupedMedia).length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', pt: 10, color: 'var(--mac-text-secondary)' }}>
        <MaterialSymbol icon="folder_off" size={80} sx={{ mb: 2, opacity: 0.7 }} />
        <Typography sx={{ fontSize: '20px', fontWeight: 500 }}>{t(k.MEDIA_EMPTY)}</Typography>
      </Box>
    );
  }

  return (
    <>
      {Object.keys(groupedMedia).map((date) => (
        <Box key={date} sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--mac-text-secondary)', mb: 2, pl: 1.5 }}>{date}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
            {groupedMedia[date].map((item: any, i: number) => (
              <MediaCard 
                key={item.id || item.filePath || i} 
                item={item} 
              />
            ))}
          </Box>
        </Box>
      ))}
      
      {hasMore && onLoadMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 6 }}>
          <Button
            onClick={onLoadMore}
            startIcon={<MaterialSymbol icon="expand_more" size={20} />}
            sx={{
              borderRadius: '500px',
              px: 4,
              py: 1.25,
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none',
              color: isDark ? '#fff' : '#000',
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)',
                border: 'none',
                boxShadow: 'none',
              }
            }}
          >
            {t(k.MEDIA_LOAD_MORE) || 'Load More'} {remainingCount > 0 ? `(${remainingCount})` : ''}
          </Button>
        </Box>
      )}
    </>
  );
}
