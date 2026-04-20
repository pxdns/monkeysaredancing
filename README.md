# Pixel Standalone - Retroscope Edition

A standalone retro-themed client launcher with AES-256 encryption and Google OAuth authentication.

## Features

- **Retroscope Theme**: CRT-style aesthetic with scanlines and neon colors
- **Four Client Options**:
  - Tuff Client JS
  - Tuffclient WASM
  - XPClient (protected Pixel Client)
  - WASM Launcher (JS + WASM modes)
- **AES-256 Encryption**: Military-grade security using Web Crypto API
- **Google OAuth Sign-In**: Required for accessing protected clients
- **LocalStorage Import**: Import your Minecraft settings from other clients

## Structure

```
pixelstandalone/
├── index.html          # Main retroscope-themed launcher page
├── style.css           # CRT aesthetic and retro styling
├── auth.js             # AES-256 encryption + Google OAuth
├── launcher.js         # Client launching logic
├── WASM/               # WASM client files
│   ├── assets.epw
│   ├── bootstrap.js
│   └── ...
├── JS/                 # JavaScript client files
│   ├── assets.epk
│   ├── classes.js
│   └── ...
└── assets/             # Protected client files
    └── pixelclient.html
```

## Authorized Users

- e42xec@gmail.com
- xpknown@gmail.com

## Usage

1. Open `index.html` in a web browser
2. Sign in with Google (must be authorized)
3. Select your preferred client:
   - **Tuff Client JS**: Standard JavaScript client
   - **Tuffclient WASM**: WebAssembly client
   - **XPClient**: Protected Pixel Client with anti-tamper
   - **WASM Launcher**: Choose between JS or WASM mode
4. (Optional) Import your Minecraft settings via JSON paste or file upload

## Security Features

- AES-256-GCM encryption for session data
- PBKDF2 key derivation with 100,000 iterations
- Right-click context menu disabled
- DevTools keyboard shortcuts blocked
- Drag-and-drop protection
- Session token expiry (5 minutes)

## Requirements

- Modern web browser with Web Crypto API support
- For WASM mode: Chrome with JSPI enabled (chrome://flags)

## Credits

Based on Texture Studio and Pixel Client codebases.
