# Task Plan: Android 翻页时钟 App (FlipClock)

## Goal
做一个原生 Android（Kotlin + Jetpack Compose）翻页时钟 App，核心场景是充电时全屏待机显示，翻页动画要有真实机械翻页钟的质感（阴影/高光/落定回弹），v1 含秒翻页 + 4-5 套预设主题 + 12/24h + 自定义签名 + 防烧屏/自动亮度/防误触退出。详细需求与架构见 `C:\Users\binbi\.claude\plans\ipad-app-flickering-deer.md`（已批准，作为本计划的需求来源，不要重新讨论范围）。

## Current Phase
Phase 1（已完成，等待用户有空后从 Phase 2 开始）

## Phases

### Phase 1: 需求与设计（已完成）
- [x] 通过 brainstorming 澄清需求范围（场景、视觉风格、动画还原度、待机行为、设置项）
- [x] 用户追加需求：秒翻页 + 多主题预设，已并入范围
- [x] 完整实施计划已写入并批准：`C:\Users\binbi\.claude\plans\ipad-app-flickering-deer.md`
- **Status:** complete

### Phase 2: 项目脚手架
- [ ] Android Studio Compose 模板初始化（minSdk 26，包名 com.<org>.flipclock）
- [ ] 验证空项目在模拟器/真机能跑起来
- [ ] 建立包结构骨架（core/clock/standby/settings/ui.theme）
- **Status:** pending

### Phase 3: 静态翻页时钟 UI（无动画）
- [ ] `ClockTimeProvider`（按秒边界精确触发，注入 java.time.Clock 便于测试）
- [ ] `ClockViewModel` + `ClockUiState`（含 secondTens/secondOnes、amPm、dateText、use24h、theme）
- [ ] 静态 `FlipDigit`（上下两半 + 中缝线，不转动）
- [ ] `FlipClock`（6 位：时/分/秒 + 冒号 + AM/PM）
- [ ] `ClockScreen`（日期 + FlipClock + 签名，签名先硬编码，单一默认主题）
- [ ] 对照参考图调字体/卡片比例/配色，竖屏先行
- **Status:** pending

### Phase 4: 翻页动画
- [ ] 单数字调试页（手动滑杆控制 rotation，独立打磨阴影/高光）
- [ ] `FlipDigitState` 状态机：IDLE → FLIPPING_TOP_OUT(0→90°) → 90°crossover换内容 → FLIPPING_TOP_IN(90→180°) → SETTLING → IDLE
- [ ] `graphicsLayer` rotationX/cameraDistance/transformOrigin 实现卡片旋转
- [ ] `FlipCardShadow`：Canvas 阴影/高光，alpha 由 `computeShadowAlpha`/`computeHighlightAlpha` 纯函数计算（可单测）
- [ ] 落定回弹细节（keyframes overshoot 或两段式 spring）
- [ ] 接入秒位每秒连续翻页场景，确认性能/流畅度
- [ ] 测试"全部 6 位数字同时翻页"（整点场景）不卡顿
- **Status:** pending

### Phase 5: 设置与持久化 + 主题
- [ ] `SettingsRepository`（DataStore：use24h, signatureText, themeId）
- [ ] `SettingsViewModel` + `SettingsScreen`（12h/24h 开关、签名输入限 60 字符、主题预设选择列表）
- [ ] `ClockTheme` 数据类 + `ClockThemePresets`（经典黑/复古绿/暖色木质/纯黑夜间等 4-5 套）
- [ ] `FlipDigit`/`ClockScreen`/`FlipCardShadow` 改为接收 ClockTheme 参数而非硬编码颜色
- [ ] 设置页与主屏导航打通，验证主题切换正确联动
- **Status:** pending

### Phase 6: 待机模式行为（需真机测试）
- [ ] `StandbyController`：`FLAG_KEEP_SCREEN_ON` + 全屏沉浸（隐藏系统栏）
- [ ] `BrightnessController`：`Sensor.TYPE_LIGHT` 监听 + 滑动平均去噪 + 分段映射亮度 + 无传感器兜底 `screenBrightness=-1f`
- [ ] `BurnInShifter`：每 ~2 分钟内容整体小幅 Offset 偏移（±8-12dp，限定安全边距）
- [ ] `ExitGesture`：长按触发二次确认退出提示，3 秒超时取消
- [ ] 真机挂充电 30 分钟+ 验证常亮、亮度自适应、秒位连续翻页下的功耗/发热
- **Status:** pending

### Phase 7: 横竖屏/折叠屏适配与打磨
- [ ] 横屏布局（字号/间距调整）
- [ ] 配置变化下翻页动画状态存活（rememberSaveable/状态提升）
- [ ] 折叠屏内外屏切换、烧屏偏移避开镂空/铰链区域（折叠屏模拟器测试）
- [ ] 最终视觉打磨（阴影/配色/字体）、App 图标
- **Status:** pending

## Key Questions
1. 秒位每秒连续翻页对功耗/发热影响有多大？— 待 Phase 6 真机实测后决定是否需要加"省电模式：秒位不翻页"开关（v1 暂不强制做）。
2. 目标测试设备是否有 `Sensor.TYPE_LIGHT`？— 待 Phase 6 真机验证，无则走系统自动亮度兜底。

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 单 Activity + 单 module，包按功能分（core/clock/standby/settings/ui.theme） | v1 规模小，多 module 是过度设计 |
| 不用 Hilt/网络库，手写简单 DI | YAGNI，v1 无需依赖注入框架 |
| 翻页动画自定义实现（graphicsLayer + Canvas），不用第三方库/Lottie | 需要精确控制阴影/高光质感，且数字内容动态，Lottie 不适用 |
| 常亮用窗口 `FLAG_KEEP_SCREEN_ON` 而非 WakeLock | 更简单，自动随 Activity 生命周期管理，满足待机场景需求 |
| `clock/` 包禁止依赖 `standby/`/Activity/Window API | 保留 v2 桌面小组件/锁屏复用 `ClockViewModel`/`FlipClock` 的可能性 |
| v1 加入秒翻页 + 4-5 套预设主题（不支持自定义颜色） | 用户对照参考 App 完整功能单后明确要求加入，自定义颜色留 v2 |
| 闹钟/计时器/倒计时/番茄钟/桌面小组件/白噪音 排除在 v1 之外 | 用户明确这些是参考 App 的附加功能，v1 只做翻页时钟本体体验 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| （尚未开始实施，无错误记录） | - | - |

## Notes
- 详细架构/包结构/风险分析见批准的计划文件：`C:\Users\binbi\.claude\plans\ipad-app-flickering-deer.md`，开始 Phase 2 前先重读一遍。
- 用户要求：计划做好后暂停，不要立即开始写代码，等用户有空时再继续。**当前应停止在此，不要自动推进到 Phase 2。**
- 每完成一个 Phase 更新本文件状态，并在 progress.md 记录本次会话进展。
- 真机相关项（Phase 6）模拟器无法准确验证，必须上真实设备测试。
