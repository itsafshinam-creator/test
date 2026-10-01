# 🗡️ Shadows of Aether — Telegram Mini App (3D Action / Stealth / Adventure)

**Shadows of Aether** is a high-performance 3D Third-Person Action, Stealth, Parkour, and Exploration RPG designed specifically for the **Telegram Mini App** ecosystem. Built using **TypeScript**, **React 19**, **Three.js**, **Tailwind CSS**, and **Web Audio API**, it runs natively on **Android, iOS, Windows, macOS, and modern browsers** with zero external CDN dependencies and zero plug-ins.

---

## 🌟 Key Features

1. **Telegram Mini App Integration**:
   - Auto-detection via `Telegram.WebApp.ready()`, `expand()`, and viewport adaptation.
   - User profile identification (`tg.initDataUnsafe.user`) with seamless fallback to `DEV_USER` in standard browsers / localhost.
   - Native Haptic Feedback (`Telegram.WebApp.HapticFeedback.impactOccurred`, `notificationOccurred`).

2. **Responsive Hybrid Controls**:
   - **Mobile**: Virtual Analog Joystick on the left, touch action buttons on the right (Attack, Block/Heavy, Dodge Roll, Jump/Vault, Stealth/Crouch, Interact) with smooth camera swipe rotation.
   - **Desktop**: Standard WASD movement, Space (Jump/Vault), Shift (Sprint), Left-click (Attack), Right-click (Heavy / Block), C (Stealth/Crouch), E (Interact), Esc (Menu).

3. **Core Gameplay & Stealth System**:
   - **Dynamic Vision Cone AI**: Guards have realistic vision angles and hearing ranges.
   - **Stealth Multiplier**: Crouching halves sight range; stepping into **Straw Hay Wagons** or **Dark Alcoves** makes the player virtually invisible (0.05 visibility).
   - **Stealth Takedown**: Sneaking directly behind unalerted enemies triggers an instant silent execution.
   - **Combat System**: Light attack combos, heavy strikes, dodge rolls with invulnerability frames, and block reduction (80% damage absorption with metallic parry sound).

4. **Parkour & Traversal**:
   - Raycast-driven obstacle vaulting over crates and low walls.
   - Ledge-grabbing and vertical hoisting onto rooftops and high balconies.
   - The Great Spire with spiral platforms scaling up to 16m vantage point.

5. **Missions & Storyline (Chapters 1–5)**:
   - **Chapter 1: The Forgotten City** (Main Quest: *The Missing Relic* with Merchant Darius).
   - **Chapter 2: Whispers in the Market** (Quest: *Shadows on the Rooftops* with Master Elion).
   - Live quest tracker, objective waypoints, dialogue branching, and reward claiming.

6. **Web3 & Offline Resilience**:
   - Modular `/web3` layer (`wallet.ts`, `blockchain.ts`, `token.ts`, `nft.ts`).
   - TON & Telegram Wallet connection simulator with testnet faucet (+100 AETH) and NFT badge minting (*Ancient Relic Hunter*, *Master of Shadows*).
   - **100% Offline-Playable**: If disconnected from Web3 or the internet, the game runs smoothly via local storage and client-side logic.

7. **Procedural Web Audio Engine**:
   - Zero MP3/CDN dependency. Footsteps, sword whooshes, parry clangs, alert stingers, and ambient minor-mode chords synthesized in real-time via Web Audio API.

---

## 🚀 Quick Start & Development

### 1. Requirements
- Node.js 18+ or 20+
- npm 9+

### 2. Installation
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for Production
```bash
npm run build
```
Production assets are generated in the `/dist` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 📱 Telegram Bot & Mini App Setup Guide

To launch **Shadows of Aether** inside Telegram:

### Step 1: Create a Bot on Telegram
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts to choose a bot name and username (e.g., `ShadowsOfAetherBot`).
3. Save the returned `BOT_TOKEN`.

### Step 2: Configure the Web App
1. In `@BotFather`, send `/newapp`.
2. Select your newly created bot.
3. Enter the Title: `Shadows of Aether`.
4. Enter the Short Description: `3D Action & Stealth Adventure`.
5. Upload a 640x360 app icon or cover art.
6. Enter the **HTTPS Web URL** where your game is deployed (e.g., `https://yourdomain.com` or your Cloud Run URL).
7. Choose a short name (e.g., `game` or `play`).

### Step 3: Set Menu Button
1. Send `/setmenubutton` to `@BotFather`.
2. Select your bot.
3. Set the button text to `Play Shadows of Aether`.
4. Provide the HTTPS Web URL.
5. Now, any Telegram user opening your bot will see a prominent **"Play"** button that launches the game in fullscreen!

---

## 🔒 Deployment Instructions (HTTPS Web Server)

Telegram requires all Mini Apps to be served over **HTTPS** with secure headers.

### Option A: Static Hosting (Vercel / Cloudflare Pages / GitHub Pages)
1. Run `npm run build`.
2. Deploy the `dist` folder to your provider.
3. Ensure HTTPS is enforced.

### Option B: Node.js / Docker / Cloud Run
The repository includes an Express server capable of serving the SPA build:
```bash
npm run build
node -e "const express = require('express'); const app = express(); app.use(express.static('dist')); app.listen(3000, () => console.log('Ready on :3000'));"
```

---

## ⛓️ Web3 Integration Architecture

The Web3 subsystem is structured under `/src/web3`:
- `types.ts`: TypeScript contracts for wallets, tokens, transactions, and NFTs.
- `wallet.ts`: Wallet connection state manager (TON Connect / Telegram Wallet / EVM).
- `blockchain.ts`: Transaction record simulator and network availability observer.
- `token.ts`: Balance manager for the **AETH** ecosystem token.
- `nft.ts`: On-chain NFT badge and relic ownership manager.

### How to Connect Real TON Blockchain:
To transition from Testnet/Mock to mainnet TON:
1. Install `@tonconnect/ui-react` via `npm install @tonconnect/ui-react`.
2. In `src/web3/wallet.ts`, replace the simulated handshake with the TonConnect provider initialized with your `manifestUrl`.
3. In `src/web3/token.ts`, connect to a Jetton contract address using `@ton/ton`.
4. The core gameplay loop remains completely untouched and decoupled!

---

## 🖥️ Backend API Specification (Roadmap)

While the game is fully playable client-side with `localStorage` saves, the backend architecture is designed to support:
- `POST /api/user/auth`: Validates Telegram `initData` HMAC hash on the server.
- `GET /api/save/load`: Fetches cloud save file matching `user.id`.
- `POST /api/save/sync`: Stores game progress with version validation (`saveVersion: 1`).
- `POST /api/quest/verify`: Server-side anti-cheat verification for high-tier AETH rewards.

---

## 🎮 Game Controls Summary

| Action | Desktop Keyboard & Mouse | Mobile Touch Controls |
| :--- | :--- | :--- |
| **Move** | `W`, `A`, `S`, `D` or Arrow Keys | Left Virtual Analog Joystick |
| **Sprint** | Hold `Shift` | Automatic when pushing joystick to edge |
| **Look / Camera** | Click & Drag Mouse | Drag anywhere on screen |
| **Jump / Vault** | `Space` | `Jump` Button (Arrow Up) |
| **Stealth / Crouch** | `C` | `Stealth` Button (Footprints) |
| **Primary Attack** | Left Mouse Click | `Attack` Button (Sword) |
| **Heavy / Block** | Right Mouse Click | `Shield` Button |
| **Dodge Roll** | Double-tap direction | `Dodge` Button (Wind) |
| **Interact / Takedown** | `E` | `E / TAP` Floating Prompt |
| **Menu / Pause** | `Esc` | `MENU` Top Bar Button |

---

## 🛠️ Troubleshooting & Fallbacks

1. **Black screen or WebGL failure**:
   - The engine automatically catches context losses and runs through `GlobalErrorBoundary`.
   - Toggle Graphics Quality to **Low** in Settings to disable shadow maps on older mobile devices.
2. **Audio suspended on mobile**:
   - Web Audio contexts require initial user gesture; audio starts playing automatically upon first tap on screen or joystick.
3. **Running outside Telegram**:
   - `TelegramManager` automatically detects the environment and instantiates a `DEV_USER` session so developers can test directly on `localhost`.
