# FlipClock

[中文](./README-zh.md) | English

[![Web Demo](https://img.shields.io/badge/Web-Live%20Demo-f38020?logo=cloudflarepages&logoColor=white)](https://flipclock-wpz.pages.dev/)
[![Android](https://img.shields.io/badge/Android-Jetpack%20Compose-3ddc84?logo=android&logoColor=white)](https://github.com/absswds/clock/releases)
[![Release](https://img.shields.io/github/v/release/absswds/clock?display_name=tag)](https://github.com/absswds/clock/releases)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20JUnit-4b5563)](https://github.com/absswds/clock/actions)
[![License](https://img.shields.io/badge/License-Not%20selected-9ca3af)](./LICENSE)

A calm flip-clock experience for desk, bedside, and focus use. The project ships both a React/Vite web app and a native Android app built with Jetpack Compose, with the same core modes, local persistence, and theme direction.

**Links**

- [Live Demo](https://flipclock-wpz.pages.dev/)
- [GitHub Releases](https://github.com/absswds/clock/releases)
- [Cloudflare Pages Project](https://flipclock-wpz.pages.dev/)
- [Chinese README](./README-zh.md)

## Why this project

FlipClock is built around a simple idea: a large, legible full-screen clock should still feel warm and tactile. Instead of piling on utility-panel clutter, the project keeps the main clock front and center, then adds timer, stopwatch, countdown, focus, themes, time-format control, time-zone override, and localized default signatures around it.

The current public theme set stays intentionally tight:

- `Paper Desk`
- `Classic Black`
- `Pure Black`

## Feature Set

- Full-screen flip clock with optional seconds
- 12-hour and 24-hour display
- Language-aware default signature text
- Theme presets shared across Web and Android
- Timer, stopwatch, countdown, and focus modes
- Browser-local persistence for Web settings and countdown targets
- Android DataStore persistence for user settings and productivity state
- Manual time-zone override for the main clock
- Cloudflare Pages deployment for the Web app

## Platform Notes

**Web**

- Built with React 19, TypeScript, Vite, and Vitest
- Deploys to Cloudflare Pages from GitHub Actions
- Best for quick sharing and trying theme/layout changes

**Android**

- Built with Kotlin and Jetpack Compose
- Native APK is published through GitHub Releases
- Includes responsive tuning for smaller phones instead of simply mirroring the desktop web canvas

## Development

**Web**

```bash
cd web
npm install
npm run dev
```

Useful commands:

```bash
npm run test
npm run lint
npm run build
```

**Android**

This repository keeps `gradle/wrapper/gradle-wrapper.properties`, but not the wrapper scripts or `gradle-wrapper.jar`.

Use Android Studio, or install Gradle locally and run:

```bash
gradle :app:testDebugUnitTest
gradle :app:assembleDebug
```

The debug APK is generated at `app/build/outputs/apk/debug/app-debug.apk`.

## Releases

Tagging `v*` triggers the release workflow and uploads:

- `flipclock-web-<tag>.zip`
- `flipclock-android-debug-<tag>.apk`

The Android artifact is currently a debug-signed preview package. A production Android release still needs signing configuration and a release build pipeline.

## Deploying the Web App

The GitHub workflow at [.github/workflows/deploy-web.yml](./.github/workflows/deploy-web.yml) runs tests, builds `web/dist`, and deploys to Cloudflare Pages.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Inspiration

This project borrows from the broader physical flip-clock language, not from any specific app's code, brand, or assets. The goal is to build an original implementation with its own theme system, interaction details, release flow, and cross-platform shape.

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
