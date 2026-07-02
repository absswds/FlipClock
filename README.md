# FlipClock

[中文](./README-zh.md) | English

[![Web Demo](https://img.shields.io/badge/Web-Live%20Demo-f38020?logo=cloudflarepages&logoColor=white)](https://flipclock-wpz.pages.dev/)
[![Android](https://img.shields.io/badge/Android-Jetpack%20Compose-3ddc84?logo=android&logoColor=white)](https://github.com/absswds/clock/releases)
[![Release](https://img.shields.io/github/v/release/absswds/clock?display_name=tag)](https://github.com/absswds/clock/releases)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20JUnit-4b5563)](https://github.com/absswds/clock/actions)

A calm flip-clock for desk, bedside, and focus. Ships as a React web app and a native Kotlin/Compose Android app — same modes, same themes, local-first persistence.

- [Live Demo](https://flipclock-wpz.pages.dev/)
- [GitHub Releases](https://github.com/absswds/clock/releases)

## Features

- Full-screen flip clock with realistic mechanical animation (3D rotation, shadows, overshoot)
- 12/24-hour display, optional seconds, AM/PM indicator
- Timer, stopwatch, countdown, and Pomodoro focus modes
- Editable timer — tap or swipe to adjust hours, minutes, seconds before starting
- Countdown with preset targets (New Year, Christmas, etc.) and custom entries
- Delete any countdown target (presets or custom) with confirmation
- Three theme presets: Paper Desk, Classic Black, Pure Black
- 10 interface languages: 中文, English, 日本語, 한국어, Français, Deutsch, Español, Português, Русский, العربية
- Manual time-zone override for the main clock
- Language-aware default signature
- Burn-in protection, ambient brightness, and exit-confirm gesture (Android)
- Local persistence: browser localStorage (Web) / DataStore Preferences (Android)

## Development

**Web**

```bash
cd web
npm install
npm run dev        # start dev server
npm run test       # Vitest
npm run build      # production build → web/dist
```

Built with React 19, TypeScript, Vite, and Vitest. Deploys to Cloudflare Pages on every push to the main branch.

**Android**

```bash
gradle :app:testDebugUnitTest
gradle :app:assembleDebug
```

Built with Kotlin and Jetpack Compose (minSdk 26). The Gradle wrapper scripts are not committed — open the project in Android Studio or install Gradle locally. The debug APK lands at `app/build/outputs/apk/debug/app-debug.apk`.

## Releases

Push a `v*` tag to trigger the release workflow. Each release publishes:

- `flipclock-web-<tag>.zip`
- `flipclock-android-<tag>.apk`

## Project Structure

```text
.
|-- app/                    Android app source
|-- web/                    React/Vite web app
|-- docs/project/           Working notes and progress logs
|-- gradle/                 Gradle version catalog and wrapper metadata
|-- .github/workflows/      Release and deployment automation
|-- README.md               English public overview
`-- README-zh.md            Chinese public overview
```
