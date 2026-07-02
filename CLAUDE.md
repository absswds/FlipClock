# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlipClock — a full-screen flip clock for bedside/desk. Built with Kotlin + Jetpack Compose (Android), React + TypeScript + Vite (Web), and a Go desktop launcher. Both platforms share the same core modes, themes, and local-first persistence. The signature feature is a realistic mechanical flip-digit animation (3D rotation + shadows/highlights + overshoot), built with custom Compose graphics — no Lottie/third-party animation libs.

**What exists**: flip clock with seconds, 12/24h, 3 theme presets, custom signature, long-press → settings. Timer, Stopwatch, Countdown, and Pomodoro with flip-style displays shared across Android and Web. Desktop launcher (single .exe) for offline local deployment.

**Not yet built**: standby behaviors (ambient brightness, burn-in shift, exit-confirm gesture), landscape/foldable polish, production release signing.

## Planning Files

- `docs/project/task_plan.md` — phased implementation plan, key decisions
- `docs/project/findings.md` — requirements, research, technical decisions
- `docs/project/progress.md` — per-session progress log

## Architecture

**Android** — single module, single Activity, no nav library. `FlipClockApp.kt` hand-rolls DI (one `SettingsRepository` + one `ProductivityRepository` shared across VMs) and switches between 6 destinations: Clock, Timer, Stopwatch, Countdown, Focus, Settings.

```
app/src/main/java/com/binbi/flipclock/
├── MainActivity.kt             # Edge-to-edge, FLAG_KEEP_SCREEN_ON, hide system bars
├── FlipClockApp.kt             # Hand-rolled DI, 6-destination routing
├── core/
│   ├── time/
│   │   ├── ClockTimeProvider.kt # Flow<LocalDateTime>, re-aligns to each second boundary
│   │   └── TimeFormat.kt        # H12 / H24 enum
│   └── settings/
│       ├── SettingsRepository.kt # DataStore ("user_settings")
│       ├── UserSettings.kt       # timeFormat, showSeconds, signature, themeId
│       └── AppLanguage.kt        # 10-language enum + labelFor() lookup
├── clock/                       # MUST NOT depend on Activity/Window APIs
│   ├── ClockViewModel.kt        # buildState() is a PURE testable fn
│   ├── ClockUiState.kt
│   ├── ClockScreen.kt           # date + FlipClock + signature; long-press → settings
│   ├── FlipClock.kt             # Width-driven sizing: 3 UnitFlipCards via BoxWithConstraints
│   └── flip/
│       ├── UnitFlipCard.kt      # One rounded card per time unit; shared hinge seam
│       ├── FlipGlyph.kt         # ONE flipping digit; Animatable<Float> 0°→180°
│       ├── FlipAnimationSpec.kt # keyframes + overshoot (182°→180°)
│       └── FlipCardShadow.kt    # Pure angle→alpha fns; JUnit-testable
├── productivity/
│   ├── ProductivityViewModels.kt
│   ├── ProductivityScreens.kt    # All 4 tool screens + StageArea, PrimaryTime, etc.
│   ├── ProductivityRepository.kt # DataStore ("productivity_settings")
│   ├── ProductivityModels.kt     # TimerState, CountdownTarget, PomodoroState, etc.
│   ├── CountdownCalculator.kt    # remaining() + CountdownPresets.forYear()
│   ├── TimerEditor.kt           # TimerEditState + TimerSegment (adjust/toMillis)
│   ├── FlipDurationDisplay.kt   # calculateFlipDurationLayout + StageFlipHeights
│   └── ChimePlayer.kt           # AudioTrack-synthesized chime (bypasses silent mode)
├── settings/
│   ├── SettingsViewModel.kt
│   └── SettingsScreen.kt
└── ui/theme/
    ├── ClockTheme.kt             # @Immutable: background, card, digit, hinge, bevel
    ├── ClockThemePresets.kt      # PaperDesk, ClassicBlack, PureBlack
    └── ClockType.kt              # Digit font token
```

**Web** — React 19 + TypeScript + Vite, single-page with bottom nav bar. Same 6 pages.

```
web/src/
├── App.tsx                       # Routing + DI (hooks wired here)
├── components/                   # ClockScreen, TimerScreen, CountdownScreen, etc.
├── hooks/                        # useTime, useTimer, useCountdown, usePomodoro, etc.
├── logic/                        # buildState, i18n, themes, notify (playChime/alertComplete)
└── styles/
```

**Desktop launcher** (`desktop/`) — Go 1.23 program that embeds `web/dist` into a single Windows .exe (no console window). Double-click starts a local HTTP server on a random port and opens the browser. Build: `cd desktop && build.bat`.

```
desktop/
├── main.go             # embed dist, HTTP server, auto-open browser
├── go.mod
└── build.bat           # xcopy web/dist + go build → flipclock-desktop.exe
```

**Key boundary**: `clock/` must NOT import from `standby/` or `Activity`/`Window` APIs.

**Two DataStores**: `user_settings` (clock/settings) and `productivity_settings` (timer defaults, countdown targets, pomodoro, hidden preset keys).

**Completion sound**: Android uses `ChimePlayer` (AudioTrack PCM synthesis, USAGE_ALARM — works on silent). Web uses `notify.ts` (Web Audio API three-tone chime + browser Notification).

## Productivity sizing system

`calculateFlipDurationLayout()` in `FlipDurationDisplay.kt` — **width-first**: divides available width by weighted glyphs (digits × 1.0 + separators × 0.12), card height = glyph width × 1.78, capped at 92% of container. Optional `scaleFactor` boosts cardHeight/fontSize without touching width.

- `StageFlipHeights.primary` = 364 / compact = 307 (Timer/Stopwatch/Focus)
- `StageFlipHeights.secondary` = 340 / compact = 280 (Countdown)
- `StageArea`: 390dp compact / 468dp
- Countdown uses `scaleFactor = 1.2f`

## How the flip animation works

- **`FlipGlyph`** — one digit, `Animatable<Float>` 0°→180°. At rest renders one undivided full-height glyph.
- **Panels**: `r < 90°` old top flap falls (`rotationX = -r`). `r >= 90°` new bottom flap drops in (`rotationX = -(180-r)`).
- **`Half`** — custom Layout measuring at full height, laying out at half — bisects glyph at seam.
- **`UnitFlipCard`** — `Row` of `FlipGlyph`s flush, single hinge seam + bevel via `matchParentSize()`.
- **Shadows** — pure functions in `FlipCardShadow`, painted as black/white scrims.

## Key Tech Decisions

- minSdk 26, targetSdk/compileSdk 34, JVM 17
- No Hilt/DI framework, no third-party animation libs
- Flip: `graphicsLayer { rotationX; cameraDistance; transformOrigin }` + Canvas scrims
- `buildState()` in `ClockViewModel` is a pure function — JUnit-testable
- 10 languages via `AppLanguage` + `labelFor()`
- Real Gradle path: `C:\Users\binbi\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat`

## Build & Test

**Android**:
```bash
gradle :app:testDebugUnitTest                                              # All JUnit tests
gradle :app:testDebugUnitTest --tests "com.binbi.flipclock.productivity.*"  # Productivity only
gradle :app:testDebugUnitTest --tests "com.binbi.flipclock.clock.ClockViewModelTest"  # Single class
gradle :app:assembleDebug                                                  # Build APK
gradle :app:lint
```

Test files: `FlipCardShadowTest`, `ClockViewModelTest`, `ClockThemePresetsTest`, `TimerEditorBehaviorTest`, `FlipDisplayPartsTest`.

**Web**:
```bash
cd web && npm install
npm run dev       # http://localhost:5173
npm run test      # Vitest (6 files, 40 tests)
npm run build     # → web/dist
npm run lint      # Oxlint
```

**Desktop**:
```bash
cd desktop && build.bat    # → flipclock-desktop.exe (~6MB)
```

## Gotchas

- **Digit sizing is width-bound** — taller cards alone don't enlarge digits. More width needed.
- **Digit vertical centering**: `LineHeightStyle.Trim.FirstLineTop` in `FlipGlyph.DigitFace`. Don't use `Trim.Both` — clips `0`/`6`/`8`/`9`.
- `new_year_eve_` must match BEFORE `new_year_` in `localizedCountdownTitle()`.
- `countdownTargets` in DataStore stores only custom targets. Presets come from `CountdownPresets.forYear()`.
- `hiddenPresetKeys` persist deleted presets so they don't reappear on rebuild.
- Gradle build cache on Windows may fail — delete `app/build/tmp` or set `org.gradle.caching=false`.
- `desktop/` needs `web/dist` built first; the `build.bat` handles the copy.
- Empty `web/dist/fonts/` dir must have a placeholder file for Go `embed` to work.
