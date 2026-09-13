import React, { useState, useEffect } from 'react';
import { Box, Typography, ButtonBase, useMediaQuery } from '@mui/material';
import MaterialSymbol from '../shared/MaterialSymbol';
import { useI18n } from '../../i18n/I18nContext';
import { k } from '../../i18n/k';
import { SettingsSection, SettingsRow } from '../shared/SettingsSection';
import { useIsDark } from '../shared/hooks';
import NammilLogo from '../../assets/nammil_outline.webp';
import DeveloperAvatar from '../../assets/developer_profile.png';
import pkg from '../../../package.json';

const openUrl = (url: string) => {
  if ((window as any).electronAPI && (window as any).electronAPI.openExternal) {
    (window as any).electronAPI.openExternal(url);
  } else {
    window.open(url, '_blank');
  }
};

// Phase 1: About Developer Tab
export function DeveloperTab() {
  const { t } = useI18n();
  const isDark = useIsDark();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Developer Profile Hero */}
      <SettingsSection sx={{ mt: 1, mb: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3.5, px: 3 }}>
          <img
            src={DeveloperAvatar}
            alt={t(k.ABOUT_DEV_NAME)}
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <Typography sx={{ mt: 2, fontSize: '22px', fontWeight: 'bold', color: 'var(--mac-text)' }}>
            {t(k.ABOUT_DEV_NAME)}
          </Typography>

          {/* Monochrome Pill Button for Portfolio */}
          <ButtonBase
            onClick={() => openUrl('https://jaiprakashpartha.vercel.app/')}
            sx={{
              mt: 2,
              px: 2.5,
              py: 1.1,
              borderRadius: '50px',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              color: 'var(--mac-text)',
              fontSize: '13.5px',
              fontWeight: 600,
              fontFamily: '"Elvan Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Typography
              component="span"
              sx={{
                fontFamily: 'inherit',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'inherit',
                lineHeight: 1,
              }}
            >
              {t(k.ABOUT_VISIT_PORTFOLIO)}
            </Typography>
            <MaterialSymbol icon="arrow_forward" size={16} />
          </ButtonBase>
        </Box>
      </SettingsSection>

      {/* Connect Section */}
      <SettingsSection title={t(k.ABOUT_CONNECT_TITLE)} sx={{ mb: 2 }}>
        <SettingsRow
          icon={<MaterialSymbol icon="mail" size={18} fill={true} />}
          iconColor="monochrome"
          title={t(k.ABOUT_EMAIL)}
          description="jaiprakashpartha@gmail.com"
          control={<MaterialSymbol icon="chevron_right" size={18} color="var(--mac-text-secondary)" />}
          onClick={() => openUrl('mailto:jaiprakashpartha@gmail.com')}
        />
        <SettingsRow
          icon={<MaterialSymbol icon="work" size={18} fill={true} />}
          iconColor="monochrome"
          title={t(k.ABOUT_LINKEDIN)}
          description="linkedin.com/in/jaiprakashpartha"
          control={<MaterialSymbol icon="chevron_right" size={18} color="var(--mac-text-secondary)" />}
          onClick={() => openUrl('https://www.linkedin.com/in/jaiprakashpartha')}
        />
        <SettingsRow
          icon={<MaterialSymbol icon="code" size={18} fill={true} />}
          iconColor="monochrome"
          title={t(k.ABOUT_GITHUB)}
          description="github.com/elvanparthasarathy"
          control={<MaterialSymbol icon="chevron_right" size={18} color="var(--mac-text-secondary)" />}
          onClick={() => openUrl('https://github.com/elvanparthasarathy')}
        />
        <SettingsRow
          icon={<MaterialSymbol icon="location_on" size={18} fill={true} />}
          iconColor="monochrome"
          title={t(k.ABOUT_LOCATION)}
          description={t(k.ABOUT_LOCATION_VAL)}
        />
      </SettingsSection>
    </Box>
  );
}

// Phase 2: About App Tab
export function AboutAppTab() {
  const { t } = useI18n();
  const isDark = useIsDark();
  const isDesktopWide = useMediaQuery('(min-width: 1200px)');
  const [version, setVersion] = useState(`v${pkg.version}`);

  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.getAppVersion) {
      (window as any).electronAPI.getAppVersion().then((v: string) => {
        if (v && v !== '2.2.0') setVersion(`v${v}`);
      });
    }
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {/* App Header with 96px Rounded Container */}
      <Box sx={{ mt: 1.5, mb: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '26px',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
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
        </Box>
        <Typography sx={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--mac-text)', letterSpacing: '-0.01em' }}>
          {t(k.BRAND_NAME)}
        </Typography>
        <Typography sx={{ color: 'var(--mac-text-secondary)', mt: 0.5, fontSize: '14px', fontWeight: 500, opacity: 0.85 }}>
          {t(k.ABOUT_FROM_BRAND)}
        </Typography>
        <Typography sx={{ color: 'var(--mac-text-secondary)', opacity: 0.6, mt: 0.5, fontSize: '12.5px', fontWeight: 500 }}>
          {version}
        </Typography>
      </Box>

      {/* What is Nammil? */}
      <SettingsSection title={t(k.ABOUT_WHAT_IS_NAMMIL)} sx={{ mb: 2 }}>
        <Box sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: '14px', lineHeight: '23px', color: 'var(--mac-text-secondary)', whiteSpace: 'pre-line' }}>
            {t(k.ABOUT_NAMMIL_DESC)}
          </Typography>
        </Box>
      </SettingsSection>

      {/* Features - 2x2 on wide desktop, single column on small/restored screens */}
      <SettingsSection title={t(k.ABOUT_FEATURES_TITLE)} sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isDesktopWide ? '1fr 1fr' : '1fr',
          }}
        >
          <SettingsRow
            icon={<MaterialSymbol icon="group" size={20} fill={true} />}
            iconColor="monochrome"
            title={t(k.ABOUT_FEAT_MULTI_ACCOUNT)}
            description={t(k.ABOUT_FEAT_MULTI_ACCOUNT_DESC)}
            sx={{
              p: '16px 20px',
              borderRight: isDesktopWide ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)') : 'none',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
              height: '100%',
            }}
          />
          <SettingsRow
            icon={<MaterialSymbol icon="folder" size={20} fill={true} />}
            iconColor="monochrome"
            title={t(k.ABOUT_FEAT_ORGANIZER)}
            description={t(k.ABOUT_FEAT_ORGANIZER_DESC)}
            sx={{
              p: '16px 20px',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
              height: '100%',
            }}
          />
          <SettingsRow
            icon={<MaterialSymbol icon="notifications" size={20} fill={true} />}
            iconColor="monochrome"
            title={t(k.ABOUT_FEAT_NOTIF)}
            description={t(k.ABOUT_FEAT_NOTIF_DESC)}
            sx={{
              p: '16px 20px',
              borderRight: isDesktopWide ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)') : 'none',
              borderBottom: isDesktopWide ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)'),
              height: '100%',
            }}
          />
          <SettingsRow
            icon={<MaterialSymbol icon="security" size={20} fill={true} />}
            iconColor="monochrome"
            title={t(k.ABOUT_FEAT_PRIVACY)}
            description={t(k.ABOUT_FEAT_PRIVACY_DESC)}
            sx={{
              p: '16px 20px',
              height: '100%',
            }}
          />
        </Box>
      </SettingsSection>

      {/* Version Footer */}
      <Typography sx={{ mt: 2, mb: 1.5, textAlign: 'center', fontSize: '12px', color: 'var(--mac-text-secondary)', opacity: 0.4 }}>
        {t(k.BRAND_NAME)} {version}
      </Typography>
    </Box>
  );
}

// Phase 3: Elvan Navil / Brand Tab
export function BrandTab() {
  const { t } = useI18n();
  const isDark = useIsDark();
  const [version, setVersion] = useState(`v${pkg.version}`);

  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.getAppVersion) {
      (window as any).electronAPI.getAppVersion().then((v: string) => {
        if (v && v !== '2.2.0') setVersion(`v${v}`);
      });
    }
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Brand Card / Hero */}
      <SettingsSection sx={{ mt: 1, mb: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3.5, px: 3, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--mac-text)' }}>
            {t(k.ABOUT_PARENT_BRAND_NAME)}
          </Typography>

          {/* Monochrome Pill Button for Brand Website */}
          <ButtonBase
            onClick={() => openUrl('https://elvannavil.vercel.app')}
            sx={{
              mt: 2.25,
              px: 2.75,
              py: 1.15,
              borderRadius: '50px',
              overflow: 'hidden',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              color: 'var(--mac-text)',
              fontSize: '13.5px',
              fontWeight: 600,
              fontFamily: '"Elvan Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Typography
              component="span"
              sx={{
                fontFamily: 'inherit',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'inherit',
                lineHeight: 1,
              }}
            >
              elvannavil.vercel.app
            </Typography>
            <MaterialSymbol icon="arrow_forward" size={16} />
          </ButtonBase>
        </Box>
      </SettingsSection>

      {/* Footer: Version and Copyright */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--mac-text-secondary)', opacity: 0.45 }}>
          {t(k.BRAND_NAME)} {version}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: '12px', color: 'var(--mac-text-secondary)', opacity: 0.35 }}>
          {t(k.ABOUT_ALL_RIGHTS_RESERVED)}
        </Typography>
      </Box>
    </Box>
  );
}

export default function AboutTab() {
  return <AboutAppTab />;
}


