import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { getTheme } from './theme';
import TopBar from './components/TopBar';
import Settings from './components/Settings/index';
import WhatsAppViews from './components/WhatsAppViews';
import SplashScreen from './components/SplashScreen';
import MediaLibrary from './components/Media/index';
import NotificationsPage, { NotificationItem } from './components/NotificationsPage/index';
import { useI18n } from './i18n/I18nContext';
import Onboarding from './components/Onboarding/index';

function App() {
  const { setLang } = useI18n();
  const [showSplash, setShowSplash] = useState(true); // Locked on splash screen until user exits
  const [userTheme, setUserTheme] = useState('system');
  const [activeTab, setActiveTab] = useState('settings');
  const [accounts, setAccounts] = useState([{ id: 'default', name: 'personal' }]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isFirstBoot, setIsFirstBoot] = useState(false);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem('nammil-notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // One-time initialization: load settings, accounts, and set the initial tab
  useEffect(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getSettings().then((settings: any) => {
        if (settings) {
          if (settings.language) {
            setLang(settings.language);
            try { localStorage.setItem('nammil-language', settings.language); } catch {}
          }
          if (settings.theme) setUserTheme(settings.theme);
          if (settings.accounts && settings.accounts.length > 0) {
            setAccounts(settings.accounts);
            setActiveTab(`wa-${settings.accounts[0].id}`);
          }
          if (settings.isFirstBoot === true) setIsFirstBoot(true);
        }
        setSettingsLoaded(true);
      }).catch(() => {
        setSettingsLoaded(true);
      });
    } else {
      setSettingsLoaded(true);
      setActiveTab('wa-default');
    }
  }, []);

  // Controls splash screen dismissal coordinated with WhatsApp loading
  useEffect(() => {
    if (!settingsLoaded) return;

    let isDismissed = false;
    let minTimePassed = false;
    let waReady = false;

    const performDismiss = () => {
      if (isDismissed) return;
      isDismissed = true;

      // 1. Attach WhatsApp view before fading out splash
      if (!isFirstBoot && (window as any).electronAPI) {
        const currentTab = activeTabRef.current;
        const targetView = currentTab.startsWith('wa-') ? currentTab.replace('wa-', '') : currentTab;
        (window as any).electronAPI.switchTab(targetView);
      }

      // 2. Smoothly dismiss splash screen
      setShowSplash(false);
      if ((window as any).__dismissSplash) {
        (window as any).__dismissSplash();
      }
    };

    // If first boot (Onboarding), no WhatsApp view to wait for
    if (isFirstBoot) {
      const timer = setTimeout(performDismiss, 800);
      return () => clearTimeout(timer);
    }

    // If not running in Electron (e.g. browser preview)
    if (!(window as any).electronAPI) {
      const timer = setTimeout(performDismiss, 600);
      return () => clearTimeout(timer);
    }

    const targetId = accounts[0]?.id || 'default';

    // Check if WhatsApp is already ready (e.g. warm reload)
    if ((window as any).electronAPI.isWhatsAppReady) {
      (window as any).electronAPI.isWhatsAppReady(targetId).then((ready: boolean) => {
        if (ready) {
          waReady = true;
          if (minTimePassed) performDismiss();
        }
      }).catch(() => {});
    }

    // Listen for whatsapp-ready event from main process
    const removeListener = (window as any).electronAPI.onWhatsAppReady ? (window as any).electronAPI.onWhatsAppReady((data: any) => {
      if (!data || data.accountId === targetId || !data.accountId) {
        waReady = true;
        if (minTimePassed) performDismiss();
      }
    }) : () => {};

    // Minimum display time for a smooth polished splash (600ms)
    const minTimer = setTimeout(() => {
      minTimePassed = true;
      if (waReady) performDismiss();
    }, 600);

    // Safety fallback timer: guarantee splash dismissal even if network is slow or offline
    const maxTimer = setTimeout(() => {
      performDismiss();
    }, 10000);

    return () => {
      if (typeof removeListener === 'function') removeListener();
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [settingsLoaded, isFirstBoot, accounts]);

  // Switch view on tab change (only after splash finishes)
  useEffect(() => {
    if (!showSplash && !isFirstBoot && (window as any).electronAPI) {
      const targetView = activeTab.startsWith('wa-') ? activeTab.replace('wa-', '') : activeTab;
      (window as any).electronAPI.switchTab(targetView);
    }
  }, [showSplash, activeTab, isFirstBoot]);

  // Listen for custom audio preview requests from Settings tab
  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.onPlayNotificationSound) {
      const removeListener = (window as any).electronAPI.onPlayNotificationSound((soundType: string, customPath?: string) => {
        const bundledMp3s = ['thuli', 'thullal', 'thendral', 'minnal', 'kumizhi', 'alai'];
        let src = '';
        if (bundledMp3s.includes(soundType)) {
          src = `./sounds/${soundType}.mp3`;
        } else if (soundType === 'custom' && customPath) {
          src = `nammil://media/${encodeURIComponent(customPath)}`;
        }
        if (!src) return;
        const audio = new Audio(src);
        audio.play().catch(() => {});
      });
      return () => removeListener();
    }
  }, []);

  // Listen for notification clicks from main.js to switch active tab to the account that sent the notification
  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.onSwitchToAccountTab) {
      const removeListener = (window as any).electronAPI.onSwitchToAccountTab((tabId: string) => {
        setActiveTab(tabId);
      });
      return () => removeListener();
    }
  }, []);

  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.onReceivedNotification) {
      const removeListener = (window as any).electronAPI.onReceivedNotification((item: NotificationItem) => {
        setNotifications((prev) => {
          const newList = [item, ...prev];
          return newList.slice(0, 200); // Keep max 200 notifications
        });
      });
      return () => removeListener();
    }
  }, []);

  // Sync notifications to localStorage and taskbar badge
  useEffect(() => {
    try {
      localStorage.setItem('nammil-notifications', JSON.stringify(notifications));
      if ((window as any).electronAPI && (window as any).electronAPI.setTaskbarBadge) {
        const unreadCount = notifications.filter(n => !n.read).length;
        (window as any).electronAPI.setTaskbarBadge(unreadCount);
      }
    } catch {}
  }, [notifications]);

  // Synchronize notifications and active tab when accounts change (e.g. account deleted)
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const validAccountIds = new Set(accounts.map((a: any) => a.id));
      setNotifications((prev) => {
        const filtered = prev.filter((n) => !n.accountId || validAccountIds.has(n.accountId));
        return filtered.length !== prev.length ? filtered : prev;
      });

      if (activeTab.startsWith('wa-')) {
        const currentWaId = activeTab.replace('wa-', '');
        if (!validAccountIds.has(currentWaId)) {
          setActiveTab(`wa-${accounts[0].id}`);
        }
      }
    }
  }, [accounts, activeTab]);

  const actualMode = userTheme === 'system' ? (prefersDarkMode ? 'dark' : 'light') : userTheme;
  const theme = getTheme(actualMode);

  if (!settingsLoaded || showSplash) {
    const hasHtmlSplash = typeof document !== 'undefined' && !!document.getElementById('splash-overlay');
    if (hasHtmlSplash) {
      return (
        <Box sx={{ width: '100vw', height: '100vh', bgcolor: actualMode === 'dark' ? '#0A0A0A' : '#FAFAFA' }} />
      );
    }
    return (
      <Box sx={{ width: '100vw', height: '100vh', bgcolor: actualMode === 'dark' ? '#0A0A0A' : '#FAFAFA' }}>
        <SplashScreen userTheme={userTheme} />
      </Box>
    );
  }

  if (isFirstBoot) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Onboarding onComplete={(newAccounts) => {
          setAccounts(newAccounts);
          setActiveTab(`wa-${newAccounts[0].id}`);
          setShowSplash(true);
          setIsFirstBoot(false);
        }} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: 'background.default' }}>
        <TopBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          accounts={accounts} 
          unreadNotificationCount={notifications.filter(n => !n.read).length}
          notifications={notifications}
        />
        
        <Box sx={{ flexGrow: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          {activeTab === 'settings' && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'background.default', zIndex: 10 }}>
              <Settings accounts={accounts} setAccounts={setAccounts} userTheme={userTheme} setUserTheme={setUserTheme} />
            </Box>
          )}
          {activeTab === 'media' && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'background.default', zIndex: 10 }}>
              <MediaLibrary accounts={accounts} />
            </Box>
          )}
          {activeTab === 'notifications' && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'background.default', zIndex: 10 }}>
              <NotificationsPage
                accounts={accounts}
                notifications={notifications}
                onClearAll={() => setNotifications([])}
                onClearAccount={(accountName) => setNotifications((prev) => prev.filter(n => n.accountName !== accountName))}
                onClearSingle={(id) => setNotifications((prev) => prev.filter(n => n.id !== id))}
                onSelectNotification={(item) => {
                  setActiveTab(`wa-${item.accountId}`);
                  setNotifications((prev) => prev.filter(n => n.id !== item.id));
                  if ((window as any).electronAPI && (window as any).electronAPI.switchTab) {
                    (window as any).electronAPI.switchTab(item.accountId);
                  }
                }}
                onAddDevTestNotification={() => {
                  const now = Date.now();
                  const acc1 = accounts[0] || { id: 'acc1', name: 'Personal' };
                  const acc2 = accounts[1] || { id: 'acc2', name: 'Work' };
                  
                  const testNotifs = [
                    {
                      id: `dev-${now}-1`,
                      title: 'Elvan',
                      body: 'Hey! Could you review the latest PR? There is a massive refactor in the core module that touches the database synchronization logic, and we really need to make sure it doesn\'t break anything in production before our big launch tomorrow. Let me know what you think!',
                      accountName: acc1.name,
                      accountId: acc1.id,
                      timestamp: now,
                    },
                    {
                      id: `dev-${now}-2`,
                      title: 'Project Group',
                      body: 'Who is taking the notes today?',
                      accountName: acc1.name,
                      accountId: acc1.id,
                      timestamp: now - 60000,
                    },
                    {
                      id: `dev-${now}-3`,
                      title: 'Project Group',
                      body: 'I can do it!',
                      accountName: acc1.name,
                      accountId: acc1.id,
                      timestamp: now - 120000,
                    },
                    {
                      id: `dev-${now}-4`,
                      title: 'Project Group',
                      body: 'Thanks 🙏',
                      accountName: acc1.name,
                      accountId: acc1.id,
                      timestamp: now - 180000,
                    },
                    {
                      id: `dev-${now}-5`,
                      title: 'Client',
                      body: 'Approved.',
                      accountName: acc2.name,
                      accountId: acc2.id,
                      timestamp: now - 3600000,
                    },
                  ];

                  setNotifications((prev) => [...testNotifs, ...prev].slice(0, 200));
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
