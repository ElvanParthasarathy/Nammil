<div align="center">
  <img src="public/app_icon.png" alt="Nammil Logo" width="108" />
  <h1>Nammil (நம்மில்)</h1>
  <p><strong>A beautifully crafted, privacy-focused desktop companion for WhatsApp featuring multi-account sessions, automated media organization, and native notifications.</strong></p>
  <p><em>Part of the <strong>Elvan Navil</strong> ecosystem • Conceived & Developed by <strong>Elvan Parthasarathy</strong></em></p>

  <p>
    <a href="https://github.com/ElvanParthasarathy/Nammil/releases/latest"><img src="https://img.shields.io/github/v/release/ElvanParthasarathy/Nammil?color=00c853&label=Release&style=flat-square" alt="Latest Release" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="MIT License" /></a>
    <img src="https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?logo=windows&style=flat-square" alt="Windows 10/11" />
    <img src="https://img.shields.io/badge/Stack-Electron%20%7C%20React%2019%20%7C%20TypeScript-61DAFB?logo=react&style=flat-square" alt="Tech Stack" />
    <a href="https://elvannavil.vercel.app"><img src="https://img.shields.io/badge/Brand-Elvan%20Navil-6C5CE7?style=flat-square" alt="Elvan Navil" /></a>
    <a href="https://jaiprakashpartha.vercel.app/"><img src="https://img.shields.io/badge/Founder-Elvan%20Parthasarathy-00cec9?style=flat-square" alt="Founder & Developer" /></a>
  </p>
</div>

---

## 💡 The Problem Nammil Solves

The official WhatsApp Desktop and WhatsApp Web clients have significant limitations on desktop:
- **Strict Single-Account Lock**: They only allow one active phone number at a time. Users managing personal, business, client, or family accounts are forced to juggle multiple browser windows, incognito profiles, or heavy third-party workarounds that leak memory and drain system resources.
- **Cluttered Downloads & Disorganized Media**: Standard web clients dump every received picture, meme, voice note, and document into your generic `Downloads` folder, creating disorganized clutter.
- **Intrusive or Unreliable Notifications**: Browser notifications frequently fail when tabs fall asleep, lack bespoke sound options, and fail to focus the correct chat session on click.
- **No Native Desktop Ergonomics**: Web wrappers lack genuine desktop integration, requiring manual reloading and tedious updates.

**Nammil** was created by **Elvan Parthasarathy** under the **Elvan Navil** brand to provide a seamless, native desktop solution:
1. **Isolated Multi-Account Sandboxing**: Run multiple independent WhatsApp accounts side-by-side with zero cookie, session, or credential collision.
2. **Automated Local Media Organizer**: Automatically groups received media into clean directories by type (Images, Videos, Documents, Audio) with search, preview, and Recycle Bin recovery.
3. **Quiet Native Notifications**: Custom sound chimes, unread counters, and reliable 1-click focus back into chats.
4. **100% Offline Privacy**: Zero external telemetry, zero tracking, zero intermediate cloud servers. All sessions and files remain strictly on your local PC.

---

## ✨ Key Features

- 👥 **Multi-Account WhatsApp Sandboxing**:
  - Run up to 5 independent WhatsApp accounts simultaneously.
  - Each account runs in its own isolated Electron persistent session (`persist:whatsapp_{id}`) with independent storage and cookies.
  - Instant account switching via a sleek top navigation bar.

- 📂 **Automated Media Organizer**:
  - Automatically indexes and organizes incoming photos, videos, voice recordings, and documents into dedicated folders (`Documents\Nammil\Media`).
  - Built-in media explorer with fast search, thumbnail previews, format filters, and a safe Recycle Bin restore system.

- 🔔 **Native Windows Desktop Notifications**:
  - Native Windows notifications with unread badge counters.
  - Six bespoke notification sound chimes (*Kumizhi*, *Minnal*, *Alai*, *Thendral*, *Thuli*, *Thullal*).
  - Per-account custom sound assignment so you immediately know which account received a message.
  - Clicking any notification instantly unhides, restores, and focuses Nammil right to that account.

- 🔄 **Chrome-Style Silent Background Updates**:
  - Background update checks against GitHub Releases without interrupting chats.
  - Real-time TopBar update pill displaying download progress (`Updating... 45%`).
  - One-click `[Relaunch to Update]` button for instant 1-second upgrades, or silent automatic installation when closing the app.

- 🎨 **Modern Fluent UI & Bespoke Typography**:
  - Clean, distraction-free interface built with React 19, Vite, and Material UI.
  - Features the custom **Elvan Sans** font for a distinctive, elegant typographic feel.
  - Full automatic sync with Windows Light, Dark, and System themes.

- 🌐 **Deep Multilingual Localization**:
  - Out-of-the-box native localization for 6 languages and scripts:
    - 🇺🇸 **English (US)**
    - 🇮🇳 **Tamil (தமிழ்)**
    - 🇮🇳 **Tamil Latin (Thamizh)**
    - 🇮🇳 **Malayalam (മലയാളം)**
    - 🇮🇳 **Malayalam Latin (Manglish)**
    - 🔣 **Neram**

- 🛡️ **Zero-Admin & Complete Local Privacy**:
  - Installs cleanly into `%LOCALAPPDATA%\Programs\Nammil` without requiring Windows UAC administrator elevation.
  - Zero telemetry, analytics, or remote tracking. Your chats and media communicate strictly between your computer and WhatsApp official servers.

---

## 📥 Download & Installation

Download the latest installer from [GitHub Releases](https://github.com/ElvanParthasarathy/Nammil/releases/latest):

- **Installer**: `Nammil-Setup.exe` (~114 MB)
- **Requirements**: Windows 10 or Windows 11 (64-bit)
- **Install Type**: Per-user installation (Zero UAC prompts, clean uninstaller included)

---

## 🏗️ Architecture

```
Elvan Nammil/
├── src/                      # React 19 + TypeScript frontend
│   ├── components/           # TopBar, MediaViewer, Notifications, Settings, About
│   ├── devtools/             # SplashDesigner developer tools
│   ├── i18n/                 # Localization engine (English, Tamil, Malayalam, Neram)
│   ├── App.tsx               # Main application view & tab routing
│   └── main.tsx              # React entry point
├── services/                 # Modular Electron backend services
│   ├── WindowManager.cjs     # Main window lifecycle, tray, single-instance lock
│   ├── WhatsAppViewManager.cjs # Multi-account WebContentsView partition sandboxing
│   ├── NotificationManager.cjs # Windows native toast notifications & audio chimes
│   ├── UpdateManager.cjs     # Chrome-style silent background updater
│   └── StorageManager.cjs    # Media indexing, file organization & Recycle Bin
├── public/                   # Static assets, sound chimes (.mp3/.wav), Elvan Sans fonts
├── installer.iss             # Inno Setup 6 packaging configuration
├── main.cjs                  # Electron main process entry
└── preload.cjs               # Secure contextBridge IPC layer
```

---

## 🛠️ Development & Building

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or newer recommended)
- `npm` (v10 or newer)
- [Inno Setup 6](https://jrsoftware.org/isinfo.php) (for building the Windows setup executable)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ElvanParthasarathy/Nammil.git
cd Nammil
npm install
```

### 2. Run in Development Mode
```bash
npm run start:dev
```
*Spawns the Vite development server with Hot Module Replacement (HMR) and connects the Electron application.*

### 3. Build & Package
```powershell
# Compile the React frontend and pack the Electron binaries
npm run build:pack

# Compile the Inno Setup installer
& "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe" installer.iss
```
The final standalone installer will be generated at:
`build-release\Nammil Setup.exe`

---

## 🏢 Brand & Creator

- **Brand**: [Elvan Navil](https://elvannavil.vercel.app) — *Thoughts, writings, and digital creations.*
- **Founder & Developer**: [Elvan Parthasarathy](https://jaiprakashpartha.vercel.app/)
  - **GitHub**: [@ElvanParthasarathy](https://github.com/elvanparthasarathy)
  - **LinkedIn**: [in/jaiprakashpartha](https://www.linkedin.com/in/jaiprakashpartha)
  - **Email**: [jaiprakashpartha@gmail.com](mailto:jaiprakashpartha@gmail.com)
  - **Location**: Arani, Tamil Nadu, India

---

## ⚖️ Legal Disclaimer & Trademark Notice

**Nammil** is an independent, open-source desktop companion developed by **Elvan Parthasarathy** under the **Elvan Navil** brand.

- **WhatsApp** is a registered trademark of WhatsApp LLC and Meta Platforms, Inc.
- **Nammil** is not affiliated with, endorsed, sponsored, authorized, or certified by WhatsApp LLC, Meta Platforms, Inc., or any of their subsidiaries or affiliates.
- All WhatsApp Web sessions, messages, media, and encryption protocols are handled directly between your computer and official WhatsApp servers. Nammil does not intercept, modify, or transmit your data to any third party.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Copyright © 2026 **Elvan Navil**. All rights reserved.
