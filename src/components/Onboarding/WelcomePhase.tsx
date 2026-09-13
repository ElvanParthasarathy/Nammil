import React, { useState } from 'react';
import { OnboardingLayout, OnboardingButton } from './OnboardingComponents';
import MaterialSymbol from '../shared/MaterialSymbol';
import { List, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { useI18n } from '../../i18n/I18nContext';
import { k } from '../../i18n/k';

export default function WelcomePhase({ onContinue }: { onContinue: () => void, skipGreeting?: boolean }) {
    const { t, lang, setLang } = useI18n();

    const handleLanguageSelect = (code: string) => {
        setLang(code);
        if ((window as any).electronAPI) {
            (window as any).electronAPI.saveSetting('language', code);
        }
    };

    return (
        <OnboardingLayout hideLogo maxWidth="md">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: '890px', // wide horizontal layout
                margin: '0 auto',
                width: '100%',
                position: 'relative',
                padding: '0 24px' // add some padding for smaller windows
            }}>
                {/* LANGUAGE SELECTION SCREEN */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                }}>
                    {/* 2-PANEL LAYOUT */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '56px',
                        flexWrap: 'wrap'
                    }}>
                            
                            {/* LEFT PANEL: Info */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                flex: 1,
                                minWidth: '300px',
                                gap: '24px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '20px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                    }}>
                                        <MaterialSymbol icon="language" size={40} color="var(--onboarding-text)" />
                                    </div>
                                    <div style={{
                                        textAlign: 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}>
                                        <h1 style={{
                                            fontSize: 'clamp(22px, 3.5vw, 28px)', // Reduced size to prevent excessive wrapping
                                            fontWeight: '700',
                                            color: 'var(--onboarding-text)',
                                            margin: 0,
                                            letterSpacing: '-0.5px',
                                            lineHeight: 1.2
                                        }}>
                                            {t(k.OB_SELECT_LANG)}
                                        </h1>
                                    <p style={{
                                        fontSize: '15px',
                                        color: 'var(--onboarding-text-secondary)',
                                        margin: 0,
                                        fontWeight: '400' // Slimmed font
                                    }}>
                                        {t(k.OB_SELECT_LANG_SUB)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL: Language List & Action */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: '300px',
                        }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '380px',
                                backgroundColor: 'var(--onboarding-input-bg)',
                                borderRadius: '16px',
                                padding: '8px 0',
                                overflow: 'hidden',
                            }}>
                                <List sx={{
                                    maxHeight: '320px',
                                    overflowY: 'auto',
                                    p: 0,
                                    '&::-webkit-scrollbar': { width: '6px' },
                                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                                    '&::-webkit-scrollbar-thumb': { background: 'var(--onboarding-divider)', borderRadius: '10px' },
                                }}>
                                {[
                                    { code: 'system', label: t(k.LANG_SYSTEM) },
                                    { code: 'ta', label: 'தமிழ்', sub: t(k.LANG_TA) },
                                    { code: 'ta_latn', label: 'Thamizh', sub: t(k.LANG_TA_LATN) },
                                    { code: 'ta_ml', label: 'തമിഴ്', sub: t(k.LANG_TA_ML) },
                                    { code: 'ml', label: 'മലയാളം', sub: t(k.LANG_ML) },
                                    { code: 'ml_latn', label: 'Malayalam', sub: t(k.LANG_ML_LATN) },
                                    { code: 'ml_tam', label: 'மலயாளம்', sub: t(k.LANG_ML_TAM) },
                                    { code: 'en', label: 'English', sub: t(k.LANG_EN) }
                                ].map((l, index, arr) => (
                                    <React.Fragment key={l.code}>
                                        <ListItem disablePadding>
                                            <ListItemButton 
                                                onClick={() => handleLanguageSelect(l.code)} 
                                                sx={{
                                                    width: '100%',
                                                    py: 1.25,
                                                    px: 3,
                                                    position: 'relative',
                                                    bgcolor: 'transparent',
                                                    color: 'var(--onboarding-text)',
                                                    cursor: 'pointer',
                                                    userSelect: 'none',
                                                    transition: 'background-color 0.15s ease',
                                                    '&:hover': {
                                                        bgcolor: (theme: any) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                                                    },
                                                }}
                                            >
                                                <ListItemText 
                                                    sx={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}
                                                    primary={
                                                        <span style={{ fontSize: '15px', fontWeight: lang === l.code ? 600 : 500, color: 'var(--onboarding-text)' }}>
                                                            {l.label}
                                                        </span>
                                                    } 
                                                    secondary={
                                                        l.sub ? (
                                                            <span style={{ fontSize: '12px', color: 'var(--onboarding-text-secondary)', display: 'block', marginTop: '2px' }}>
                                                                {l.sub}
                                                            </span>
                                                        ) : undefined
                                                    }
                                                />
                                                {lang === l.code && (
                                                    <ListItemIcon sx={{ minWidth: 'auto', position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
                                                        <MaterialSymbol icon="check_circle" size={18} fill={true} color="var(--onboarding-text)" />
                                                    </ListItemIcon>
                                                )}
                                            </ListItemButton>
                                        </ListItem>
                                        {index < arr.length - 1 && <Divider sx={{ mx: 3, borderColor: 'var(--onboarding-divider)' }} />}
                                    </React.Fragment>
                                ))}
                            </List>
                            </div>

                            <div style={{ width: '100%', maxWidth: '380px', marginTop: '16px' }}>
                                <OnboardingButton onClick={onContinue}>
                                    {t(k.OB_CONTINUE)}
                                </OnboardingButton>
                            </div>
                            </div>
                        </div>
                    </div>
            </div>
        </OnboardingLayout>
    );
}
