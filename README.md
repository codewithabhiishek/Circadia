<div align="center">

# ⚡ CIRCADIA
### Local-First Circadian Rhythm Journal & Rest Telemetry

[![Live Demo](https://img.shields.io/badge/Live%20Demo-circadia--journal.vercel.app-00f0ff?style=for-the-badge&logo=vercel)](https://circadia-journal.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB%20(Local--First)-orange?style=for-the-badge&logo=databricks)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  A high-contrast cyber-brutalist sleep journal designed to track circadian consistency, nocturnal sleep debt, and daytime naps with zero cloud telemetry.
  <br />
  <strong>🔒 100% Offline-First. Zero tracking. Zero external servers. Your biometric data belongs solely to you.</strong>
</p>

[Live App](https://circadia-journal.vercel.app/) • [Features](#-features) • [Design System](#-design-system) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Data Portability](#-data-portability) • [License](#-license)

---

</div>

## 🌟 Features

- **🌙 Nocturnal Sleep & Power Nap Tracking**:
  - Precision time recording with cross-midnight sleep boundary detection.
  - Granular logging for multiple daytime power naps with instant duration aggregation.
- **📊 Circadian Analytics & Trends**:
  - Interactive sleep duration bar charts with stacked night vs. nap ratios (7D, 14D, 30D, 90D).
  - Bedtime & wake-time deviation calculations to detect circadian rhythm shifts.
- **⚡ Cyber-Brutalist & Ambient Motion**:
  - High-contrast neon accents, crisp monospace telemetry readouts, hard-shadow brutalist cards, and floating ambient background orbs powered by **Framer Motion**.
- **🔒 True Local-First Architecture**:
  - Powered by browser **IndexedDB** (`idb`). No accounts, no subscriptions, no third-party analytics trackers, and zero network calls required to run.
- **📱 PWA-Ready / Mobile First**:
  - Fullscreen standalone iOS and Android web app capabilities with custom touch icons, safe-area inset pads, and responsive bottom bar navigation.
- **💾 Complete Data Sovereignty**:
  - 1-click JSON exports for offline backups and seamless cross-device migration.

---

## 🎨 Design System

Circadia uses an intentional cyber-brutalist interface:

| Element | Specification |
| :--- | :--- |
| **Typography** | `JetBrains Mono` for telemetry & timestamps; `Manrope` for structural headers |
| **Primary Accent** | Neon Cyan (`#00f0ff`) — Active states, total durations, primary CTAs |
| **Secondary Accent**| Electric Magenta (`#ff007a` / `#a855f7`) — Nap durations & trend shifts |
| **Tertiary Accent** | Acid Lime (`#a3ff12`) — Status indicators & consistency signals |
| **Card Styling** | Hard 2px brutalist borders, flat 4px box-shadows, zero soft blur clutter |

---

## 🏗️ Architecture

```
Circadia/
├── public/
│   ├── icon.svg               # Orbital circadian neon SVG favicon
│   ├── manifest.json          # PWA progressive web app manifest
│   └── sw.js                  # Offline service worker cache
├── src/
│   ├── components/            # UI Views & Specialized Controls
│   │   ├── AnimatedCounter.tsx  # Spring-animated metric counters
│   │   ├── BackgroundOrbs.tsx   # Floating background glow orbs
│   │   ├── History.tsx          # 30-day chronological log & entry editor
│   │   ├── Insights.tsx         # Recharts circadian graphs & trend heuristics
│   │   ├── Navigation.tsx       # Dual-mode navigation (Desktop sidebar / Mobile bar)
│   │   ├── PremiumHero.tsx      # Time-aware personalized greeting & calendar HUD
│   │   ├── PremiumLoading.tsx   # Initial brutalist startup loader
│   │   ├── Settings.tsx         # Data export/import & privacy controls
│   │   └── Today.tsx            # Daily sleep input & nap management
│   ├── aiService.ts           # AI analysis heuristics & prompt generators
│   ├── db.ts                  # Local IndexedDB database manager
│   ├── ThemeContext.tsx       # Dark & Light cyber palette toggle
│   ├── types.ts               # SleepEntry, Nap, and UI state typings
│   ├── utils.ts               # Date math, duration calculators & formatters
│   ├── App.tsx                # Page controller & layout scaffold
│   ├── index.css              # Cyber-brutalist design tokens & CSS variables
│   └── main.tsx               # Application bootstrap
├── index.html                 # HTML5 PWA shell template
├── package.json               # Dependencies & scripts
└── vite.config.js             # Vite build & bundle configuration
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/)

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/codewithabhiishek/Sleep-Tracker.git Circadia

# 2. Navigate into project directory
cd Circadia

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Verification & Production Build

```bash
# Typecheck TypeScript definitions
npm run typecheck

# Build minified production bundle
npm run build
```

---

## 💾 Data Portability

Your sleep data never leaves your device unless you explicitly export it:
- **Export JSON**: In `Settings` → Click `EXPORT DATA` to save your complete log as `sleep-journal-YYYY-MM-DD.json`.
- **Import JSON**: Upload your JSON file on any other machine or browser to restore your history instantly.

---

## 📜 License

Distributed under the **MIT License**. Created by [Abhishek Jain](https://github.com/codewithabhiishek).
