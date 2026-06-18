# Task Plan: Android 翻页时钟 App (FlipClock)

## Goal
做一个原生 Android（Kotlin + Jetpack Compose）翻页时钟 App，核心场景是充电时全屏待机显示，翻页动画要有真实机械翻页钟的质感（阴影/高光/落定回弹），v1 含秒翻页 + 4-5 套预设主题 + 12/24h + 自定义签名 + 防烧屏/自动亮度/防误触退出。详细需求与架构见 `C:\Users\binbi\.claude\plans\ipad-app-flickering-deer.md`（已批准，作为本计划的需求来源，不要重新讨论范围）。

## Current Phase
重做（Rebuild）后已推进到 **Phase 4（翻页动画）代码层完成**。用户真机确认 Phase 3 外观「正常」，但提出 3 点修订：设置/签名重叠、要每单位一张卡（非每数字一卡）、要真实翻页动画。已按修订（见 plan 文件「修订 (2026-06-18)」）实现：单位卡 + 卡内逐位 3D 翻页 + 长按进设置。下一步等用户真机确认动画/外观。

## ⚠️ 重做背景与铁律
- 旧版失败根因：**原计划只有架构、零视觉设计语言** → 做出来字小、棕底棕字、卡片错位、极丑。
- **铁律：不参考 `archive/v1-ugly-attempt` 里任何旧代码的设计**。从零按下方视觉规范重建。
- 本环境无 Android SDK，无法本地编译/渲染 → **采取"先锁外观"策略**：先做脚手架+设计系统+静态时钟屏，让用户在 Android Studio 跑通确认外观，再叠加动画/待机/设置。

## 🎨 视觉设计规范（对齐用户提供的 iOS 参考图，1:1 贴近）
默认主题「纯黑经典」精确规格（详见 findings.md「目标参考设计」）：
- 背景纯黑 #000000~#0A0A0A；数字纯白/近白、**超大加粗圆润**字形；卡片深炭灰 #1C1C1E~#262626、中等圆角、中缝水平 hinge 线。
- **时钟横向占满约 80% 屏宽**，是绝对主视觉（这是修复旧版"字太小"的关键）。
- 小时不补前导零（12h 制显示 "5"）；**AM/PM 小标竖排在小时左侧**。
- 时/分/秒用间距分组，冒号弱化/省略。
- 顶部居中日期+星期浅灰小字；底部居中签名灰色小字；整体垂直居中、大量留白、极简。
- 数字字体：内置/下载一个 heavy rounded 字体（如 Poppins/Montserrat Black），系统 `FontWeight.Black` 作兜底，设计 token 化便于一行切换。
- 多主题策略：**先把这套默认黑白主题做到接近参考图精致度**，再扩展其余预设。

## Phases

### Phase 1: 需求与设计（已完成）
- [x] 通过 brainstorming 澄清需求范围（场景、视觉风格、动画还原度、待机行为、设置项）
- [x] 用户追加需求：秒翻页 + 多主题预设，已并入范围
- [x] 完整实施计划已写入并批准：`C:\Users\binbi\.claude\plans\ipad-app-flickering-deer.md`
- **Status:** complete

### Phase 2: 项目脚手架
- [x] Gradle/Compose 工程从零搭建（libs.versions.toml、settings/app build.kts、manifest、主题、图标，minSdk 26，包名 com.binbi.flipclock）
- [x] 建立包结构骨架（core/clock/settings/ui.theme；standby 留待 Phase 6）
- [ ] 验证在 Android Studio sync + 模拟器/真机跑起来（需用户本地 SDK）
- **Status:** complete（代码层面；编译待用户真机验证）

### Phase 3: 静态翻页时钟 UI（无动画）★ 外观锁定关键阶段
- [ ] `ClockTimeProvider`（按秒边界精确触发，注入 java.time.Clock 便于测试）
- [ ] `ClockViewModel` + `ClockUiState`（含 secondTens/secondOnes、amPm、dateText、use24h、theme）
- [ ] 设计系统：`ClockTheme` + 默认黑白主题 + 字体 token（heavy rounded）
- [ ] 静态 `FlipDigit`（上下两半 + 中缝 hinge 线，不转动），尺寸按"时钟占屏宽 ~80%"反推
- [ ] `FlipClock`（6 位：时/分/秒分组 + AM/PM 竖排左侧，冒号弱化），无前导零（12h）
- [ ] `ClockScreen`（顶部日期 + 居中 FlipClock + 底部签名，纯黑背景，垂直居中大留白）
- [ ] **★ 检查点：用户在 Android Studio 跑通确认外观贴合参考图后，才进入 Phase 4**
- **Status:** complete（代码层面，★检查点待用户真机确认外观）

### Phase 4: 翻页动画（按修订：单位卡 + 卡内逐位翻页）
- [x] 单个数字翻页动画器 `FlipGlyph`（无独立卡框，套在共享单位卡内）
- [x] 状态机经单个 `Animatable<Float>` 0→180° 驱动：0–90 旧上半片下落、90 crossover、90–180 新下半片落入
- [x] `graphicsLayer` rotationX/cameraDistance/transformOrigin（上片 origin 底中、下片 origin 顶中）
- [x] `FlipCardShadow`：纯函数 `computeTopFlapShadowAlpha`/`computeBottomFlapShadowAlpha`/`computeFlapHighlightAlpha`（黑/白 scrim 叠加），含 JUnit 单测 `FlipCardShadowTest`
- [x] 落定回弹：`FlipAnimationSpec.flip` keyframes 末尾 182°→180° overshoot
- [x] `UnitFlipCard`：每单位一张圆角卡（共享渐变 + 单条 hinge），卡内逐位独立翻、只翻变化的位
- [x] `FlipClock` 改为时/分/秒三张 `UnitFlipCard`；`ClockScreen` 改长按进设置（修掉与签名重叠）
- [ ] ★ 真机确认：秒位连翻流畅、整点多位同时翻不卡、动画方向/阴影观感贴近参考（本地无 SDK 未验证）
- **Status:** complete（代码层面，★检查点待用户真机确认动画与外观）

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
| ClockScreen.kt 重复 import androidx.compose.ui.unit.Dp（误把删 PaddingValues 写成加 Dp） | 1 | 自查 import 块发现并删除重复行 + 未用的 PaddingValues |
| Google Fonts 下载字体需 AS 自动生成的精确证书数组，手写易错且运行时静默失败 | 1 | 放弃下载字体，改用系统 Black 字体 token + 文档化一行切换内置 ttf 的方法 |

## Notes
- 详细架构/包结构/风险分析见批准的计划文件：`C:\Users\binbi\.claude\plans\ipad-app-flickering-deer.md`。视觉规范以本文件「🎨 视觉设计规范」+ findings.md「目标参考设计」为准。
- **重做进行中**：先做 Phase 2 脚手架 + Phase 3 静态外观，到 Phase 3 末尾的 ★ 检查点暂停，等用户真机确认外观。
- 不参考 archive/v1-ugly-attempt 旧码设计。
- 每完成一个 Phase 更新本文件状态，并在 progress.md 记录本次会话进展。
- 真机相关项（Phase 6）模拟器无法准确验证，必须上真实设备测试。

## Decisions Made（重做新增）
| Decision | Rationale |
|----------|-----------|
| 默认主题改纯黑+白色圆润粗体（替代旧棕色） | 1:1 对齐用户参考图，极致对比、最大可读性 |
| 时钟占屏宽 ~80%，尺寸由此反推卡片/字号 | 修复旧版"字太小淹没在空屏"的首要缺陷 |
| 内置/下载 heavy rounded 字体 + 系统 Black 兜底 | 贴近参考图圆润粗体质感，token 化便于切换 |
| 先做精默认主题再扩展其余预设 | 防止重蹈"一次铺 5 套全粗糙"的覆辙 |
| Phase 3 末设外观检查点，用户真机确认后再叠加 | 本地无 SDK 无法渲染，尽早消灭"丑"风险 |
