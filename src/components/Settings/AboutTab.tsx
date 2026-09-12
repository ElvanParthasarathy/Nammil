import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useI18n } from '../../i18n/I18nContext';
import { k } from '../../i18n/k';
import { SettingsSection, SettingsRow } from '../shared/SettingsSection';
import { useIsDark } from '../shared/hooks';
import NammilLogo from '../../assets/nammil_outline.webp';

export default function AboutTab() {
  const { t } = useI18n();
  const isDark = useIsDark();
  const [version, setVersion] = useState('v2.2.0');

  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.getAppVersion) {
      (window as any).electronAPI.getAppVersion().then((v: string) => {
        if (v) setVersion(`v${v}`);
      });
    }
  }, []);

  return (
    <Box sx={{ pr: '24px', pb: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box 
          sx={{ 
            width: 96,
            height: 96,
            mb: 2,
            bgcolor: 'var(--mac-text)',
            WebkitMaskImage: `url(${NammilLogo})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: `url(${NammilLogo})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }} 
        />
        <Typography sx={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--mac-text)' }}>
          {t(k.BRAND_NAME)}
        </Typography>
        <Typography sx={{ color: 'var(--mac-text-secondary)', mt: 0.5, fontSize: '15px', fontWeight: 500 }}>
          {t(k.ABOUT_PARENT_BRAND_NAME)}
        </Typography>
        <Typography sx={{ color: 'var(--mac-text-secondary)', opacity: 0.7, mt: 0.5, fontSize: '13px', fontWeight: 500 }}>
          {version}
        </Typography>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 500 }}>
        <SettingsSection>
          <SettingsRow
            title={t(k.ABOUT_PARENT_BRAND)}
            control={<Typography sx={{ color: 'var(--mac-text-secondary)', fontSize: '14px', fontWeight: 500 }}>{t(k.ABOUT_PARENT_BRAND_NAME)}</Typography>}
          />
          <SettingsRow
            title={t(k.ABOUT_DEVELOPER)}
            control={<Typography sx={{ color: 'var(--mac-text-secondary)', fontSize: '14px' }}>{t(k.ABOUT_DEV_NAME)}</Typography>}
          />
          <SettingsRow
            title={t(k.ABOUT_BUILT_WITH)}
            control={<Typography sx={{ color: 'var(--mac-text-secondary)', fontSize: '14px' }}>Electron + React + TypeScript</Typography>}
          />
        </SettingsSection>

        <SettingsSection title={t(k.ABOUT_SHORTCUTS)}>
          <SettingsRow
            title={t(k.ABOUT_SHORTCUT_DEVTOOLS)}
            control={<Typography sx={{ color: 'var(--mac-text-secondary)', fontSize: '14px' }}>F12</Typography>}
          />
          <SettingsRow
            title={t(k.ABOUT_SHORTCUT_DEVTOOLS_ALT)}
            control={<Typography sx={{ color: 'var(--mac-text-secondary)', fontSize: '14px' }}>Ctrl+Shift+I</Typography>}
          />
        </SettingsSection>
      </Box>

      <Typography sx={{ mt: 6, color: 'var(--mac-text-secondary)', fontSize: '12px' }}>
        © 2026 {t(k.ABOUT_PARENT_BRAND_NAME)} • {t(k.ABOUT_DEVELOPER)}: {t(k.ABOUT_DEV_NAME)}
      </Typography>
    </Box>
  );
}
