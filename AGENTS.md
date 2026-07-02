# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## Project Overview

FlipClock — a full-screen flip clock for bedside/desk. Android (Kotlin + Jetpack Compose) and Web (React + Vite). Realistic mechanical flip animation with 3D rotation + shadows + overshoot, built entirely with custom Compose graphics and CSS.

## Architecture

```
app/src/main/java/com/binbi/flipclock/
├── MainActivity.kt            # Edge-to-edge, keep-screen-on, hide system bars
├── FlipClockApp.kt            # Hand-rolled DI, clock ↔ settings switch
├── core/time/                 # ClockTimeProvider, TimeFormat
├── core/settings/             # SettingsRepository (DataStore), UserSettings, AppLanguage
├── clock/                     # ClockScreen, ClockViewModel, FlipClock, flip/
├── productivity/              # Timer, Stopwatch, Countdown, Pomodoro (screens, VMs, models)
├── settings/                  # SettingsScreen, SettingsViewModel
└── ui/theme/                  # ClockTheme, ClockThemePresets, ClockType
```

`clock/` must NOT import from `standby/` or `Activity`/`Window` APIs.

## Key Decisions

- minSdk 26, no DI framework, no third-party animation libs
- Flip animation: single `Animatable<Float>` (0°→180°) per digit, pure shadow/highlight functions
- Time provider recalculates delay to next second boundary (no drift)
- Persistence: DataStore Preferences (Android), localStorage (Web)
- 10 languages, 3 themes

## Build

```bash
gradle :app:testDebugUnitTest
gradle :app:assembleDebug
```
