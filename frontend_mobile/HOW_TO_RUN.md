# HOW TO RUN (Blue Angels Care - Mobile)

This document explains how to set up and run the mobile Expo app in this repository on Windows (PowerShell). It assumes you have Node.js and npm installed.

## Prerequisites

- Node.js (recommended LTS): https://nodejs.org/
- npm (comes with Node.js)
- Git (optional, for cloning): https://git-scm.com/
- Expo CLI tools (we use `npx` so global install isn't required, but you can install globally if preferred)
- A device or emulator:
  - Expo Go app on iOS/Android device (recommended for quick testing)
  - Or an Android emulator / iOS simulator (iOS requires macOS)

## Quick start (Windows PowerShell)

Open PowerShell in the project folder `frontend_mobile` and run:

```powershell
# 1. Install dependencies
npm install

# 2. Start the Expo dev server
npx expo start
```

After `npx expo start` runs you can:
- Scan the QR code with Expo Go on your phone
- Press `a` in the terminal to open Android emulator (if configured)
- Press `w` to open web

If port 8081 is busy, Expo CLI will automatically try another port (e.g. 8082). Use the URL and QR code shown.

## Typical commands

- Start dev server: `npx expo start`
- Run on Android emulator: `npx expo start` then press `a` or `npx expo run:android` (requires Android SDK)
- Run on iOS simulator: `npx expo start` then press `i` (macOS only)
- Lint: `npm run lint`
- Reset cache: `npx expo start -c` (clears Metro cache)
- Reinstall deps (if things break):
  ```powershell
  Remove-Item -Recurse -Force node_modules, package-lock.json
  npm install
  ```

## Common issues & fixes

- "Port 8081 is being used":
  - Expo will often fall back to another port automatically. If you prefer to free the port, find and kill the process using it (example PowerShell command below):
    ```powershell
    # List processes using port 8081
    netstat -ano | Select-String ":8081"
    # Kill process (replace <PID> with actual PID)
    Stop-Process -Id <PID> -Force
    ```

- "Expo doctor" reports package mismatches:
  - Run `npx expo install --check` and follow prompts. If a package still looks mismatched, try removing `node_modules` and `package-lock.json` then `npm install` again.

- Android emulator not opening:
  - Make sure Android Studio and Android SDK are installed and `ANDROID_HOME`/`ANDROID_SDK_ROOT` are configured.
  - `npx expo run:android` requires a proper Android dev environment.

## Project notes

- Entry point: `app/` directory (uses Expo Router). Routes are file-based.
- Main code lives under: `src/` (screens, components, hooks)
- If you see duplicate screens (e.g., two Login implementations), route files in `app/` should import components from `src/screens` and not contain full implementations.

## Adding native packages

Use `npx expo install <package>` to ensure SDK-compatible versions (recommended). For example:

```powershell
npx expo install expo-location
```

## Troubleshooting (detailed)

1. Node version issues:
   - Use a supported Node LTS (14/16/18/20 depending on Expo SDK). If you have issues, try switching with `nvm`.

2. Typescript errors in editor but compiling fine:
   - Run `npm run lint` and `npx tsc --noEmit` to find type errors.

3. Metro bundler cache problems:
   - `npx expo start -c`

## Helpful commands summary

```powershell
# Install deps
npm install

# Start dev server
npx expo start

# Start dev server and clear cache
npx expo start -c

# Reinstall from scratch
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Check compatibility and fix
npx expo install --check
```

## Who to contact

If you run into issues that look like app logic bugs (screens not rendering, duplicates, navigation issues), contact the project maintainer or open an issue in your tracker with steps to reproduce and terminal output.

---

Created for Blue Angels Care mobile app (Expo + React Native + Expo Router).