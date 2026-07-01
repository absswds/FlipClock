# Progress Log — FlipClock

## Session: 2026-06-17

### Phase 1: 需求与设计
- **Status:** complete
- **Started:** 2026-06-17
- Actions taken:
  - 通过 superpowers brainstorming 流程，与用户逐项澄清需求（平台、核心场景、视觉风格、动画还原度、布局、待机模式细节、设置项）
  - 用 WebFetch 抓取用户提供的参考 App（App Store「翻页时钟」类应用）功能描述
  - 派发 Plan 子代理，产出详细架构与实施顺序方案
  - 用户对照参考 App 完整功能单复核范围，追加"秒翻页"和"4-5套预设主题"进入 v1，其余功能（闹钟/计时器/倒计时/番茄钟/小组件/白噪音/自定义颜色）确认排除
  - 计划写入并更新 `C:\Users\binbi\.claude\plans\ipad-app-flickering-deer.md`，用户通过 ExitPlanMode 批准
  - 初始化本项目目录下的 planning-with-files 三文件（task_plan.md / findings.md / progress.md）
  - 用户要求：计划完成后暂停，不进入实施，等用户有空再继续
- Files created/modified:
  - `C:\Users\binbi\.claude\plans\ipad-app-flickering-deer.md`（已批准的完整计划）
  - `D:\binbi\Documents\Code\project\app\clock\task_plan.md`（新建）
  - `D:\binbi\Documents\Code\project\app\clock\findings.md`（新建）
  - `D:\binbi\Documents\Code\project\app\clock\progress.md`（新建，本文件）

### Phase 2: 项目脚手架
- **Status:** pending（首版已废弃，见下方 2026-06-18 重做会话）

## Session: 2026-06-18（重做 Rebuild）

### 背景
- 用户判定首版（archive/v1-ugly-attempt 分支，7 个 Phase）"没法用、很丑"：截图显示棕底棕字、字太小、卡片错位。
- 操作：`git branch archive/v1-ugly-attempt 760a511` 保存旧码 → `git reset --hard a0d848a` 回退到写完计划状态 → 删除工作区残留旧码/构建产物，仅保留规划文档+参考截图。
- 用户提供 iOS 参考设计图（纯黑底/白色圆润粗体大数字/PM 竖排左侧/顶部日期/底部签名），确认：1:1 贴近、先做精默认黑白主题、内置粗圆字体。视觉规范记入 findings.md + task_plan.md。

### Phase 2（重做）: 脚手架
- **Status:** complete（代码层面；本地无 Android SDK，编译未验证）
- Actions taken:
  - 版本目录 libs.versions.toml（AGP 8.5.2 / Kotlin 2.0.21 / Compose BOM 2024.09.03 / minSdk 26 / compileSdk 34）
  - settings.gradle.kts、根 build.gradle.kts、app/build.gradle.kts、gradle.properties、wrapper props(gradle 8.7)、.gitignore、proguard
  - AndroidManifest（单 Activity、KEEP_SCREEN_ON、configChanges 防重建）、strings、themes（纯黑 NoActionBar）、colors、自适应启动图标(vector)
  - 包结构 core/{time,settings}、clock/flip、settings、ui/theme

### Phase 3（重做）: 静态翻页时钟 UI ★外观锁定
- **Status:** complete（代码层面，待用户真机确认外观 = ★检查点）
- Actions taken:
  - 设计系统：ClockTheme + ClockThemePresets（默认 ClassicBlack 按参考图调色 + 另 4 套）+ ClockType 字体 token（系统 Black 兜底，可一行换内置 ttf）
  - core/time：TimeFormat、ClockTimeProvider（按秒边界精确触发，可注入 Clock）
  - core/settings：UserSettings、SettingsRepository（DataStore）
  - clock：ClockUiState、ClockViewModel（buildState 纯函数：12/24h、无前导零、日期）
  - clock/flip/FlipDigit（静态：圆角渐变卡片 + 居中大数字 + hinge 缝线 + bevel，includeFontPadding=false 保证缝线居中）
  - clock/FlipClock（按可用宽度反推卡片尺寸填满 ~90% 屏宽、按高度封顶防横屏溢出、时分秒分组、AM/PM 竖排左侧）
  - clock/ClockScreen（纯黑底、顶部日期、居中时钟、底部签名、隐藏式齿轮入口；clock 包零依赖 standby/Activity）
  - settings：SettingsViewModel + SettingsScreen（24/12h chips、显示秒开关、签名输入限60、主题横向 swatch 预览）
  - 根：FlipClockApp（手写 DI，单 SettingsRepository 喂两个 VM，Clock/Settings 切换）+ MainActivity（edge-to-edge + 常亮 + 沉浸隐藏系统栏）

### Phase 3 真机反馈 → Phase 4（重做修订）
- 用户真机安装确认外观「正常」，提出 3 点：(1) 设置齿轮和底部签名重叠；(2) 现在每数字一张小卡太分散，参考图是每个时间单位一张卡；(3) 数字只是跳变、没翻页感。
- AskUserQuestion 确认：每单位一张卡 / 卡内只翻变化的那位 / 长按进设置。已写入 plan 文件「修订 (2026-06-18)」。

### Phase 4（重做）: 翻页动画 + 单位卡
- **Status:** complete（代码层面；本地无 Android SDK，编译/动画观感未验证 = ★检查点）
- Actions taken:
  - 新增 `clock/flip/FlipAnimationSpec.kt`：单条 0→180° keyframes（末尾 182→180 回弹），不依赖跨版本不稳的 per-frame easing infix。
  - 新增 `clock/flip/FlipCardShadow.kt`：纯函数算 top/bottom flap 阴影 + flap 高光 alpha（可单测）。
  - 新增 `clock/flip/FlipGlyph.kt`：单数字 3D 翻页器（无卡框，DigitHalf 用全高渐变+裁半保证缝线/渐变跨缝对齐），单 `Animatable` 驱动，`LaunchedEffect(digit)` 只翻变化的位。
  - 新增 `clock/flip/UnitFlipCard.kt`：每单位一张圆角卡（共享渐变 + 单条 hinge + bevel），卡内 N 个 FlipGlyph 齐平。
  - 改 `clock/FlipClock.kt`：6 张 per-digit 卡 → 时/分/秒三张 UnitFlipCard；按 worst-case 字数反推稳定字号；AM/PM 仍竖排左侧。
  - 改 `clock/ClockScreen.kt`：删除 BottomCenter 设置 IconButton（与签名重叠），改根 Box `detectTapGestures(onLongPress=进设置)`。
  - 删 `clock/flip/FlipDigit.kt`（静态卡，已被 FlipGlyph/UnitFlipCard 取代）。
  - 测：`app/src/test/.../flip/FlipCardShadowTest.kt`。

### 下一步（★检查点，等用户）
- 真机/模拟器跑：确认时/分/秒各一张卡、卡内两位共缝线；秒位每秒真实翻页（上半下落→换字→下半落定带回弹/阴影）；30→31 只个位翻；长按进设置、签名不再被遮挡。
- 动画方向/阴影是观感项，本地无法渲染；若翻页方向看起来反了，调 `FlipGlyph` 里两处 `rotationX` 符号即可。
- 确认后再进 Phase 5（设置/主题打磨）、Phase 6（待机：自动亮度/防烧屏/防误触退出）。

## Test Results
| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| （尚未开始实施，无测试记录） | | | | |

## Error Log
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
| （无） | - | - | - |

## 5-Question Reboot Check
| Question | Answer |
|----------|--------|
| Where am I? | Phase 1 完成，Phase 2（项目脚手架）尚未开始，按用户要求暂停 |
| Where am I going? | Phase 2 脚手架 → Phase 3 静态UI → Phase 4 翻页动画 → Phase 5 设置/主题 → Phase 6 待机模式 → Phase 7 横竖屏/折叠屏打磨 |
| What's the goal? | 原生 Android 翻页时钟 App，待机全屏显示，含秒翻页+多主题+12/24h+签名+防烧屏/自动亮度/防误触 |
| What have I learned? | 见 findings.md（需求范围、参考App功能对照、关键技术决策） |
| What have I done? | 完成需求澄清与完整实施计划，已获用户批准，三文件已建立，尚未写任何代码 |

---
*Update after completing each phase or encountering errors*

## Session: 2026-06-18 Visual Polish Branch

### Goal
- Bring the Android tablet clock closer to the reference iPad video: compact composition, thicker charcoal cards, brighter heavy digits, stronger hinge/edge depth, and cleaner full-screen immersion.

### Actions taken
- Created branch `codex/visual-polish-reference-clock`.
- Extracted and reviewed frames from the reference video and current app video.
- Cleaned the temporary extracted-frame directory `tmp_video_frames/`.
- Added video comparison findings to `findings.md`.
- Started a TDD pass for card edge shadow math in `FlipCardShadowTest`.

### Notes
- Existing untracked/modified context files (`CLAUDE.md`, `.claude/`, `AGENTS.md`) predated this implementation pass and are not part of the intended visual-polish commit.
- `./gradlew` is missing from the repository, so Gradle verification may require Android Studio, a system Gradle install, or restoring wrapper scripts.

### Verification
- `git diff --check`: passed.
- `./gradlew test --tests "com.binbi.flipclock.clock.flip.FlipCardShadowTest"`: blocked because the repository has no `gradlew`, `gradlew.bat`, or `gradle/wrapper/gradle-wrapper.jar`.
- `./gradlew assembleDebug`: blocked for the same missing Gradle wrapper reason.

### Follow-up adjustment from user screenshot
- User clarified the target: fixed Chinese date layout (`yyyy年M月d日 EEEE`), keep the current date/clock spacing, use a simpler solid gray card face with white large digits, preserve bottom text, and make the time cards wider.
- Added a `ClockViewModelTest` expectation for the Chinese date layout.
- `.\gradlew test --tests "com.binbi.flipclock.clock.ClockViewModelTest"` remains blocked because the Gradle wrapper script is absent from the repository.

### Follow-up adjustment: wider neutral-gray cards
- User clarified the cards were still too narrow/flat and the gray was not neutral enough.
- Adjusted the default card face toward a single neutral gray with transparent edge/highlight/bevel treatment.
- Increased the clock target width and changed card proportions so each time unit reads wider.
- Added `ClockThemePresetsTest` to lock the ClassicBlack card face to solid neutral gray.
- `.\gradlew test --tests "com.binbi.flipclock.ui.theme.ClockThemePresetsTest"` remains blocked because the Gradle wrapper script is absent from the repository.

### Follow-up adjustment: wider digit feel
- User compared the latest screenshot against the reference and clarified the cards/digits still feel too flat and narrow.
- Reduced the card height-per-glyph ratio so height-limited layouts produce wider cards.
- Increased digit font size and horizontal scale so the default system Black digits read closer to the reference's broad, heavy numerals.

### Correction: restore balanced card proportions
- Latest screenshot showed the previous pass overcorrected: cards became too flat, and digits were clipped by the card bounds and hinge line.
- Increased the clock viewport height, reduced total clock width, restored a taller card aspect ratio, and changed digit scaling from heavy horizontal stretch to a light broadening.
- `.\gradlew test --tests "com.binbi.flipclock.ui.theme.ClockThemePresetsTest"` is still blocked by the missing Gradle wrapper script.

## Session: 2026-06-18 Productivity Tools

### Goal
- Add in-app Timer, Stopwatch, Countdown, and Pomodoro flows. Keep widgets, lock screen, dynamic-island-style surfaces, and background notifications out of scope.

### Actions taken
- Added test-first coverage for pure productivity logic under `app/src/test/java/com/binbi/flipclock/productivity/`.
- Added pure models/calculators for timer, stopwatch, countdown remaining-time math, fixed holiday presets, formatting, and pomodoro transitions.
- Added `ProductivityRepository` using DataStore Preferences for timer defaults, custom countdown targets, selected countdown target, and pomodoro duration settings.
- Added ViewModels for Timer, Stopwatch, Countdown, and Pomodoro. They use wall-clock timestamps for elapsed time and use coroutine ticks only to refresh UI.
- Added black-stage Compose screens for the four tools with foreground-only completion banners.
- Replaced the root two-state app switch with six destinations: Clock, Timer, Stopwatch, Countdown, Focus, Settings.

### Verification
- `git diff --check`: passed.
- `.\gradlew.bat test --tests "com.binbi.flipclock.productivity.*"`: blocked because `gradlew.bat` is missing.
- System `gradle`: unavailable.
- `gradle/wrapper/gradle-wrapper.jar`: missing; only `gradle-wrapper.properties` exists.

### Follow-up adjustment: flip-style productivity displays
- Added `FlipDurationDisplay`, a reusable Compose display that splits formatted duration text into digit groups and separators, then renders digit groups with the existing `UnitFlipCard` flip animation.
- Added `FlipDisplayPartsTest` for duration/day split behavior.
- Replaced the primary time displays in Timer, Stopwatch, Countdown, and Pomodoro with flip-style cards. Countdown keeps the target title/date as text, renders day count as a large flip number, and renders `HH:MM:SS` as flip groups.
- `.\gradlew.bat test --tests "com.binbi.flipclock.productivity.FlipDisplayPartsTest"`: blocked because `gradlew.bat` is missing.
- `gradle --version`: blocked because system Gradle is unavailable.
