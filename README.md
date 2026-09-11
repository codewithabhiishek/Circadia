<div align="center">

# 🌙 Sleep Tracker
### Private, Local-First Sleep Journal & Rest Analytics

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![IndexedDB](https://img.shields.io/badge/IndexedDB-Local--First-orange?style=for-the-badge&logo=databricks)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  A calming, modern, and private sleep journal for tracking nocturnal sleep and daytime naps.
  <br />
  <strong>100% offline-first. Your personal health data never leaves your device.</strong>
</p>

[Key Features](#-key-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Export & Backup](#-export--import) • [License](#-license)

---

</div>

## 🌟 Key Features

- **🛏️ Nocturnal Sleep & Nap Logging**: Log nighttime sleep cycles along with multiple daytime power naps.
- **📊 Smart Rest Analytics & Insights**: Visual trends, sleep efficiency curves, weekly/monthly averages powered by Recharts.
- **🔒 100% Private & Local-First**: Backed by browser IndexedDB (`idb`). No external accounts, no cloud sync, zero telemetry.
- **✨ Calming Aesthetics**: Ambient floating background orbs, smooth Framer Motion view transitions, and custom sleep theme palettes.
- **📱 Responsive & PWA-Ready**: Seamless experience across mobile devices, tablets, and desktop workstations.
- **💾 JSON Data Portability**: Export your complete historical sleep data or restore backups at any time with one click.

---

## 🏗️ Architecture

```
Sleep-Tracker/
├── public/                # Static assets & PWA manifest
├── src/
│   ├── components/        # UI Views & Components
│   │   ├── BackgroundOrbs.tsx    # Ambient animated lighting orbs
│   │   ├── History.tsx           # Past sleep logs & timeline entries
│   │   ├── Insights.tsx          # Analytics, trends, and charts
│   │   ├── Navigation.tsx        # Mobile tabbar & desktop sidebar
│   │   ├── PremiumLoading.tsx    # Smooth initial skeleton loader
│   │   ├── Settings.tsx          # Export, import, and theme controls
│   │   └── Today.tsx             # Active sleep entry & nap logger
│   ├── db.ts              # Local IndexedDB persistence layer
│   ├── ThemeContext.tsx   # Dynamic theme provider
│   ├── types.ts           # SleepEntry, Nap, and UI typings
│   ├── utils.ts           # Date math, duration calculators & formatters
│   ├── App.tsx            # Main layout controller
│   └── main.tsx           # App bootstrap
├── index.html             # Shell template
├── package.json           # Scripts and dependencies
└── vite.config.js         # Bundler config
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/)

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/codewithabhiishek/Sleep-Tracker.git

# Navigate into project directory
cd Sleep-Tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the assigned Vite port) in your browser.

### Production Build

```bash
# Verify TypeScript types
npm run typecheck

# Build optimized production bundle
npm run build
```

---

## 💾 Export & Import

Your data is yours. From the **Settings** view:
- **Export JSON**: Download your entire sleep history as an unencrypted, human-readable `.json` file for personal analysis or safe backup.
- **Import JSON**: Restore a backup onto any browser or device seamlessly.

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.
