# Project Structure

This repository contains an Android app and a Web app for the same flip-clock product idea.

## Root

```text
.
|-- app/
|-- web/
|-- docs/
|-- gradle/
|-- .github/
|-- README.md
|-- AGENTS.md
|-- CLAUDE.md
|-- build.gradle.kts
|-- settings.gradle.kts
`-- gradle.properties
```

Keep the root focused on project entry points, automation, and documentation that someone needs immediately after opening the repository.

## Android App

```text
app/src/main/java/com/binbi/flipclock/
|-- clock/          # Clock UI, state, and flip-card components
|-- core/           # Time and settings primitives
|-- productivity/   # Timer, stopwatch, countdown, and focus logic/UI
|-- settings/       # Android settings screen
|-- ui/theme/       # Compose theme presets and typography
|-- FlipClockApp.kt
`-- MainActivity.kt
```

Android tests live under:

```text
app/src/test/java/com/binbi/flipclock/
```

## Web App

```text
web/src/
|-- components/     # React screens and reusable display components
|-- hooks/          # Local state, timers, settings persistence
|-- logic/          # Pure formatting, i18n, theme, and clock-state logic
|-- styles/         # CSS for the Web experience
|-- App.tsx
|-- Root.tsx
`-- main.tsx
```

Web tests sit beside the files they verify and use `*.test.ts` or `*.test.tsx`.

## Documentation

```text
docs/project/
|-- PROJECT_STRUCTURE.md
|-- findings.md
|-- progress.md
`-- task_plan.md
```

The files in `docs/project/` are working notes and planning history. The root `README.md` is the public-facing entry point.

## Generated Or Local-Only Paths

These should not be committed:

```text
.agents/
.codex/
.claude/
.gradle/
.idea/
.kotlin/
local.properties
app/build/
web/dist/
web/node_modules/
```

The committed `.gitignore` and `web/.gitignore` exclude these paths.
