import React from 'react';
import { Box, Typography } from '@mui/material';
import { X } from '@phosphor-icons/react';
import { useIsDark } from '../shared/hooks';
import { useI18n } from '../../i18n/I18nContext';
import { Material3Button } from '../shared/Material3Button';
import { Material3IconButton } from '../shared/Material3IconButton';
import { Material3TextField } from '../shared/Material3TextField';
import { Material3Dialog } from '../shared/Material3Dialog';
import { k } from '../../i18n/k';

interface WinUIAddDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accountName: string;
  onAccountNameChange: (val: string) => void;
}

export default function WinUIAddDialog({ open, onClose, onConfirm, accountName, onAccountNameChange }: WinUIAddDialogProps) {
  const isDark = useIsDark();
  const { t } = useI18n();

  return (
    <Material3Dialog open={open} onClose={onClose} width={500}>
      <Box sx={{ width: '100%', bgcolor: isDark ? '#202020' : '#ffffff', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, pb: 0 }}>
          <Typography sx={{ fontSize: '13px', color: isDark ? '#fff' : '#000', ml: 1 }}>
            {t(k.DIALOG_ADD_ACCOUNT_TITLE)}
          </Typography>
          <Material3IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: 'var(--mac-text-secondary)', 
              '&:hover': { color: 'var(--mac-text)' } 
            }}
          >
            <X size={18} />
          </Material3IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4, pt: 3 }}>
          <Material3TextField
            autoFocus
            fullWidth
            placeholder={t(k.DIALOG_ACCOUNT_NAME_LABEL)}
            value={accountName}
            onChange={(e) => onAccountNameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && accountName.trim()) onConfirm(); }}
            sx={{
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              color: isDark ? '#fff' : '#000',
              borderRadius: '100px',
              '& fieldset': { border: 'none' },
            }}
          />
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: isDark ? '#2B2B2B' : '#F3F3F3', p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Material3Button
            onClick={onClose}
            sx={{
              color: isDark ? '#fff' : '#000',
              bgcolor: isDark ? '#333' : '#e0e0e0',
              px: 3,
              borderRadius: '24px',
              minWidth: 80,
            }}
          >
            {t(k.BTN_CANCEL)}
          </Material3Button>
          <Material3Button
            onClick={onConfirm}
            disabled={!accountName.trim()}
            sx={{
              color: isDark ? '#000' : '#fff',
              bgcolor: isDark ? '#fff' : '#000',
              px: 3,
              borderRadius: '24px',
              minWidth: 80,
            }}
          >
            {t(k.BTN_ADD)}
          </Material3Button>
        </Box>
      </Box>
    </Material3Dialog>
  );
}
