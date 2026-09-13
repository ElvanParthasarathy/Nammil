import React from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';
import { CheckCircle, Circle } from '@phosphor-icons/react';
import { useI18n } from '../../i18n/I18nContext';
import { k } from '../../i18n/k';
import { useIsDark } from '../shared/hooks';
import { SettingsSection, SettingsRow } from '../shared/SettingsSection';
import { Material3Switch } from '../shared/Material3Switch';
import { Material3IconButton } from '../shared/Material3IconButton';

export default function AppearanceTab({ userTheme, setUserTheme }: any) {
  const isDark = useIsDark();
  const { t } = useI18n();

  const handleThemeChange = (newTheme: string) => {
    setUserTheme(newTheme);
    if ((window as any).electronAPI) {
      (window as any).electronAPI.saveSetting('theme', newTheme);
      (window as any).electronAPI.updateTheme(newTheme);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <SettingsSection description={t(k.THEME_DESC)}>
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', p: 3 }}>
          {/* Light Mode Option */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <ButtonBase
              onClick={() => handleThemeChange('light')}
              sx={{
                width: 110,
                height: 85,
                borderRadius: '22px',
                bgcolor: '#f5f5f5',
                border: '1.5px solid',
                borderColor: userTheme === 'light' ? (isDark ? '#ffffff' : '#000000') : 'var(--mac-divider)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.2,
                p: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                '&:hover': {
                  borderColor: userTheme === 'light'
                    ? (isDark ? '#ffffff' : '#000000')
                    : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'),
                },
              }}
            >
              <Box sx={{ width: 32, height: 8, borderRadius: 4, bgcolor: '#000', opacity: 0.7 }} />
              <Box sx={{ width: '100%', height: 6, borderRadius: 4, bgcolor: '#cfcfcf' }} />
              <Box sx={{ width: '60%', height: 6, borderRadius: 4, bgcolor: '#cfcfcf' }} />
            </ButtonBase>

            <Typography
              onClick={() => handleThemeChange('light')}
              variant="body2"
              sx={{
                fontWeight: userTheme === 'light' ? 600 : 500,
                color: userTheme === 'light' ? 'var(--mac-text)' : 'var(--mac-text-secondary)',
                transition: 'color 0.2s',
                mt: 0.5,
                cursor: 'pointer',
                userSelect: 'none',
                '&:hover': {
                  color: 'var(--mac-text)',
                }
              }}
            >
              {t(k.THEME_LIGHT)}
            </Typography>

            <Material3IconButton
              onClick={() => handleThemeChange('light')}
              size="small"
              sx={{
                color: userTheme === 'light' ? 'var(--mac-text)' : 'var(--mac-text-secondary)',
              }}
            >
              {userTheme === 'light' ? (
                <CheckCircle weight="fill" size={22} />
              ) : (
                <Circle weight="regular" size={22} />
              )}
            </Material3IconButton>
          </Box>

          {/* Dark Mode Option */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <ButtonBase
              onClick={() => handleThemeChange('dark')}
              sx={{
                width: 110,
                height: 85,
                borderRadius: '22px',
                bgcolor: '#141415',
                border: '1.5px solid',
                borderColor: userTheme === 'dark' ? (isDark ? '#ffffff' : '#000000') : 'var(--mac-divider)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.2,
                p: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                '&:hover': {
                  borderColor: userTheme === 'dark'
                    ? (isDark ? '#ffffff' : '#000000')
                    : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'),
                },
              }}
            >
              <Box sx={{ width: 32, height: 8, borderRadius: 4, bgcolor: '#fff', opacity: 0.8 }} />
              <Box sx={{ width: '100%', height: 6, borderRadius: 4, bgcolor: '#444' }} />
              <Box sx={{ width: '60%', height: 6, borderRadius: 4, bgcolor: '#444' }} />
            </ButtonBase>

            <Typography
              onClick={() => handleThemeChange('dark')}
              variant="body2"
              sx={{
                fontWeight: userTheme === 'dark' ? 600 : 500,
                color: userTheme === 'dark' ? 'var(--mac-text)' : 'var(--mac-text-secondary)',
                transition: 'color 0.2s',
                mt: 0.5,
                cursor: 'pointer',
                userSelect: 'none',
                '&:hover': {
                  color: 'var(--mac-text)',
                }
              }}
            >
              {t(k.THEME_DARK)}
            </Typography>

            <Material3IconButton
              onClick={() => handleThemeChange('dark')}
              size="small"
              sx={{
                color: userTheme === 'dark' ? 'var(--mac-text)' : 'var(--mac-text-secondary)',
              }}
            >
              {userTheme === 'dark' ? (
                <CheckCircle weight="fill" size={22} />
              ) : (
                <Circle weight="regular" size={22} />
              )}
            </Material3IconButton>
          </Box>
        </Box>

        <SettingsRow
          title={t(k.THEME_SYSTEM)}
          control={
            <Material3Switch
              checked={!userTheme || userTheme === 'system'}
              onChange={(e) => handleThemeChange(e.target.checked ? 'system' : (isDark ? 'dark' : 'light'))}
            />
          }
        />
      </SettingsSection>
    </Box>
  );
}
