import React, { useState } from 'react';
import { Box, Typography, Menu, MenuItem } from '@mui/material';
import { ChatCircle, Palette, Translate, CaretLeft, Gear, DotsThreeVertical, HardDrives, Bell, Info, Code, Sparkle } from '@phosphor-icons/react';
import { useI18n } from '../../i18n/I18nContext';
import { k } from '../../i18n/k';
import { SidebarItem } from '../shared/SettingsSection';
import DualPanelLayout from '../shared/DualPanelLayout';
import { useIsDark } from '../shared/hooks';
import { Material3IconButton } from '../shared/Material3IconButton';
import { sanitizeName } from './validation';
import WinUIClearAllDialog from './WinUIClearAllDialog';
import AccountsTab from './AccountsTab';
import AppearanceTab from './AppearanceTab';
import LanguageTab from './LanguageTab';
import StorageTab from './StorageTab';
import NotificationsTab from './NotificationsTab';
import { DeveloperTab, AboutAppTab, BrandTab } from './AboutTab';

export default function Settings({ accounts, setAccounts, userTheme, setUserTheme }: any) {
  const { t } = useI18n();
  const isDark = useIsDark();
  const [activeTab, setActiveTab] = useState('');
  const [clearAllName, setClearAllName] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const confirmClearAll = () => {
    if (!clearAllName.trim()) return;
    const sanitized = sanitizeName(clearAllName);
    const newAccounts = [{ id: sanitized, name: sanitized }];
    setAccounts(newAccounts);
    if ((window as any).electronAPI) (window as any).electronAPI.updateAccounts(newAccounts);
    setIsClearing(false);
  };

  const getActiveTitle = () => {
    if (activeTab === 'accounts') return t(k.ACCOUNTS_TITLE);
    if (activeTab === 'notifications') return t(k.NOTIF_TITLE);
    if (activeTab === 'appearance') return t(k.THEME_TITLE);
    if (activeTab === 'language') return t(k.LANG_TITLE);
    if (activeTab === 'storage') return t(k.STORAGE_TITLE);
    if (activeTab === 'developer') return t(k.ABOUT_DEVELOPER);
    if (activeTab === 'aboutApp') return t(k.ABOUT_APP_TITLE);
    if (activeTab === 'brand') return t(k.ABOUT_PARENT_BRAND_NAME);
    return t(k.SETTINGS_TITLE);
  };

  const sidebar = (
    <>
      <SidebarItem
        icon={<ChatCircle size={20} weight="fill" />}
        iconColor="monochrome"
        title={t(k.ACCOUNTS_TITLE)}
        description={t(k.ACCOUNTS_DESC)}
        isActive={activeTab === 'accounts'}
        onClick={() => setActiveTab('accounts')}
      />
      <SidebarItem
        icon={<Bell size={20} weight="fill" />}
        iconColor="monochrome"
        title={t(k.NOTIF_TITLE)}
        description={t(k.NOTIF_DESC)}
        isActive={activeTab === 'notifications'}
        onClick={() => setActiveTab('notifications')}
      />
      <SidebarItem
        icon={<Palette size={20} weight="fill" />}
        iconColor="monochrome"
        title={t(k.THEME_TITLE)}
        description={t(k.THEME_SUBTITLE)}
        isActive={activeTab === 'appearance'}
        onClick={() => setActiveTab('appearance')}
      />
      <SidebarItem
        icon={<Translate size={20} weight="fill" />}
        iconColor="monochrome"
        title={t(k.LANG_TITLE)}
        description={t(k.LANG_SUBTITLE)}
        isActive={activeTab === 'language'}
        onClick={() => setActiveTab('language')}
      />
      <SidebarItem
        icon={<HardDrives size={20} weight="fill" />}
        iconColor="monochrome"
        title={t(k.STORAGE_TITLE) || 'Storage & Data'}
        description={t(k.STORAGE_DESC) || 'Manage your media folders'}
        isActive={activeTab === 'storage'}
        onClick={() => setActiveTab('storage')}
      />
      <SidebarItem
        icon={<Code size={20} weight="fill" />}
        iconColor="monochrome"
        title={t(k.ABOUT_DEVELOPER)}
        description={t(k.ABOUT_DEVELOPER_DESC)}
        isActive={activeTab === 'developer'}
        onClick={() => setActiveTab('developer')}
      />
      <SidebarItem
        icon={<Info size={20} weight="fill" />}
        iconColor="monochrome"
        title={t(k.ABOUT_APP_TITLE)}
        description={t(k.ABOUT_APP_DESC)}
        isActive={activeTab === 'aboutApp'}
        onClick={() => setActiveTab('aboutApp')}
      />
      <SidebarItem
        icon={<Sparkle size={20} weight="fill" />}
        iconColor="monochrome"
        title={t(k.ABOUT_PARENT_BRAND_NAME)}
        description={t(k.ABOUT_BRAND_DESC)}
        isActive={activeTab === 'brand'}
        onClick={() => setActiveTab('brand')}
      />
    </>
  );

  const content = !activeTab ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--mac-text-secondary, #aaaaaa)' }}>
      <Gear size={64} weight="fill" style={{ marginBottom: '16px', opacity: 0.5 }} />
      <Typography sx={{ fontSize: '24px', fontWeight: 600, color: 'var(--mac-text, #ffffff)' }}>
        {t(k.SETTINGS_TITLE)}
      </Typography>
    </Box>
  ) : (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
        <Material3IconButton
          onClick={() => setActiveTab('')}
          sx={{
            color: 'var(--mac-text)',
            mr: 1
          }}
        >
          <CaretLeft size={20} weight="bold" />
        </Material3IconButton>
        <Typography sx={{ fontSize: '22px', fontWeight: 600, flexGrow: 1 }}>
          {getActiveTitle()}
        </Typography>

        {activeTab === 'accounts' && accounts?.length > 0 && (
          <>
            <Material3IconButton 
              onClick={handleMenuClick}
              sx={{ 
                color: 'var(--mac-text-secondary)'
              }}
            >
              <DotsThreeVertical size={20} weight="bold" />
            </Material3IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  bgcolor: isDark ? '#2c2c2e' : '#ffffff',
                  color: isDark ? '#fff' : '#000',
                  borderRadius: '16px',
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.15)',
                  mt: 1,
                  minWidth: '160px',
                  overflow: 'hidden'
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem 
                onClick={() => { handleMenuClose(); setClearAllName(''); setIsClearing(true); }}
                sx={{ 
                  color: isDark ? '#ff4d4d' : '#d32f2f', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 77, 77, 0.15)' : 'rgba(211, 47, 47, 0.08)'
                  }
                }}
              >
                {t(k.BTN_CLEAR_ALL)}
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      <Box className="s2-tab-content" key={activeTab}>
        {activeTab === 'accounts' && <AccountsTab accounts={accounts} setAccounts={setAccounts} />}
        {activeTab === 'notifications' && <NotificationsTab accounts={accounts} />}
        {activeTab === 'appearance' && <AppearanceTab userTheme={userTheme} setUserTheme={setUserTheme} />}
        {activeTab === 'language' && <LanguageTab />}
        {activeTab === 'storage' && <StorageTab />}
        {activeTab === 'developer' && <DeveloperTab />}
        {activeTab === 'aboutApp' && <AboutAppTab />}
        {activeTab === 'brand' && <BrandTab />}
      </Box>

      <WinUIClearAllDialog
        open={isClearing}
        onClose={() => setIsClearing(false)}
        onConfirm={confirmClearAll}
        accountName={clearAllName}
        onAccountNameChange={setClearAllName}
      />
    </>
  );

  return (
    <DualPanelLayout
      title={t(k.SETTINGS_TITLE)}
      sidebar={sidebar}
      content={content}
    />
  );
}
