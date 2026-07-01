# FlipClock

A full-screen flip clock for desk, bedside, and focus scenarios.

FlipClock has two faces:

- **Android app** built with Kotlin and Jetpack Compose.
- **Web app** built with React, TypeScript, and Vite.

Both versions focus on a calm mechanical flip-clock experience, readable large digits, local settings, and simple productivity modes such as timer, stopwatch, countdown, and focus.

## Highlights

- Large flip-card clock with optional seconds.
- 12-hour and 24-hour time formats.
- Theme presets, including a paper desk look and black clock styles.
- Custom signature text with localized defaults.
- Timer, stopwatch, countdown, and focus modes.
- Browser-local persistence for Web settings and countdown state.
- Time zone override in the Web settings page.
- Reduced-motion friendly Web animation styling.

## Screens

The main experience is intentionally simple: a full-screen clock first, with the tool navigation kept out of the way.

```text
Clock -> Timer -> Stopwatch -> Countdown -> Focus -> Settings
```

## Project Structure

```text
.
|-- app/                    # Android app source
|-- web/                    # React/Vite web app
|-- docs/project/           # Planning notes and progress logs
|-- gradle/                 # Gradle version catalog and wrapper metadata
|-- .github/workflows/      # Deploy and release automation
|-- README.md               # Public project overview
`-- AGENTS.md / CLAUDE.md   # Agent-facing project notes
```

See [docs/project/PROJECT_STRUCTURE.md](docs/project/PROJECT_STRUCTURE.md) for a fuller map.

## Web Development

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
npm run preview
```

The production Web build is written to `web/dist/`.

## Android Development

This repository currently tracks `gradle/wrapper/gradle-wrapper.properties`, but not the wrapper scripts or `gradle-wrapper.jar`.

Use Android Studio, or install Gradle locally and run:

```bash
gradle :app:testDebugUnitTest
gradle :app:assembleDebug
```

The debug APK is generated at:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## Release Packages

GitHub Releases are automated by [.github/workflows/release.yml](.github/workflows/release.yml).

To create a release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow builds and uploads:

- `flipclock-web-<tag>.zip` from `web/dist/`
- `flipclock-android-debug-<tag>.apk` from the Android debug build

The Android package is a debug-signed preview build. For Play Store or production distribution, add a release signing configuration and publish a signed release APK or AAB.

## Deployment

The Web app deploy workflow is [.github/workflows/deploy-web.yml](.github/workflows/deploy-web.yml). It builds the Web app with npm and deploys `web/dist` to Cloudflare Pages when Web files change on `master`.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Notes On Inspiration

This project is inspired by the broader physical flip-clock style, not by copying a specific app's source, assets, brand, or exact screen composition. The code, themes, interactions, and documentation in this repository are maintained as original project work.

## License

No open-source license has been selected yet. Add a `LICENSE` file before promoting the repository for public reuse.
