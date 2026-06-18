# Findings & Decisions — FlipClock

## Requirements
- 原生 Android（Kotlin + Jetpack Compose），不做跨平台
- v1 核心场景：充电时手机平放，全屏常亮待机显示翻页时钟
- 翻页动画需还原真实机械翻页钟质感：3D 翻转 + 动态阴影/高光 + 落定回弹，不用第三方库/Lottie
- 布局：顶部日期+星期，中间 HH:MM:SS 翻页时钟（秒也翻页），底部用户自定义固定签名文字
- 12/24 小时制可切换，12h 模式显示 AM/PM
- v1 提供 4-5 套预设配色主题，不支持自定义颜色（自定义留 v2）
- 待机模式：常亮（FLAG_KEEP_SCREEN_ON）、环境光自动调亮度、防烧屏周期偏移、防误触二次确认退出
- 设置页：12h/24h 开关、签名输入（限 60 字符）、主题选择
- v1 明确排除：智能闹钟、计时器、秒表、倒计时、番茄钟、天气、桌面小组件、白噪音、自定义颜色
- 桌面小组件/锁屏显示是 v2，v1 只需保证 `clock/` 包架构上可被复用（不依赖 Activity/Window API）
- 不强制自动化测试，但核心逻辑（时间拆解/12-24h转换/日期格式化/阴影 alpha 计算）应设计为可单测的纯函数/State holder

## Research Findings
- 参考的 iOS App Store「翻页时钟」类应用功能清单（用户提供 URL 抓取）：
  - 主屏/锁屏/灵动岛/待机屏幕以秒为单位显示时间，全屏显示时间和日期
  - 12/24 小时模式
  - 智能闹钟，自动音量调节
  - 多种时钟主题
  - 倒计时至目标日期（元旦/圣诞/春节等）
  - 番茄工作法
  - 小组件上显示个性化签名
  - 桌面小组件支持显示秒和日历
  - 悬浮时钟/悬浮窗秒表，背景白噪音，充电时自动启动屏保
  - （该 App 体量含多功能模块；本项目 v1 只取其中"翻页时钟视觉本体 + 秒 + 多主题 + 签名 + 待机"，其余明确排除，见 Requirements）

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| minSdk 26 | 兼顾现代传感器批处理/DataStore/Compose 支持，避免过多向后兼容代码 |
| 单 Activity + Navigation-Compose 或手动 state 切换（Clock + Settings 两目的地） | 页面少，复杂导航框架无必要 |
| ClockTimeProvider 用"距下一秒边界精确毫秒数"重新计算 delay，而非固定 1000ms 累加 | 避免长时间运行后时间漂移 |
| 翻页状态机单个 Animatable 驱动 0→180°，90°处瞬时切换内容 | 经典翻页卡片实现技巧：90°时卡片边缘朝向视角不可见，切换不被察觉 |
| 阴影/高光的 alpha 计算抽成独立纯函数（非 Compose） | 可被 JUnit 单测覆盖，便于反复调试视觉效果时验证数值正确性 |
| 常亮用窗口 FLAG_KEEP_SCREEN_ON，不用 PowerManager.WakeLock | 更简单，自动随 Activity 生命周期管理，足够覆盖待机场景需求，无需额外权限 |
| 亮度控制只用窗口级 screenBrightness（不用 Settings.System，避免需要 WRITE_SETTINGS 权限） | 降低权限复杂度和兼容性风险 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| （尚未开始实施） | - |

## Resources
- 已批准的完整实施计划：`C:\Users\binbi\.claude\plans\ipad-app-flickering-deer.md`
- 项目目录：`D:\binbi\Documents\Code\project\app\clock`（当前为空，从零搭建）
- 参考 App：用户提供的 App Store 链接（翻页时钟类应用，完整功能见上方 Research Findings）

## Visual/Browser Findings

### 旧版（已废弃，archive/v1-ugly-attempt 分支）实际运行截图问题（用户提供 2 张棕色主题截图）
- 翻页卡片太小，淹没在大片空旷屏幕中，空间利用极差
- 卡片内数字被裁切/错位，秒数卡片几乎空白/破损
- 棕底棕字对比度太低，几乎看不清
- 整体粗糙、像没完成 —— 这是用户判定"没法用、很丑"的根因
- **根因诊断**：原计划只有架构、完全没有视觉设计语言定义 → 必须先定视觉规范再重做

### 目标参考设计（用户提供的 iOS「翻页时钟」App 主屏截图，2026-06-18 第 3 张图）—— 这是要对齐的标杆
左侧主屏（= 我们要做的待机翻页钟）精确视觉规范：
- **背景：纯黑 / 极深炭黑**（#000000~#0A0A0A），不是棕色。追求极致对比。
- **数字：超大、加粗、圆润 sans 字形**（类似 SF/Helvetica Heavy 的粗圆体），**纯白/近白**。
- **卡片：深炭灰**（约 #1C1C1E~#262626），圆角（中等圆角），卡片中间一条水平翻页缝线（hinge）。
- **尺寸：时钟横向占满约 80% 屏宽**，是绝对主视觉。三组数字（时/分/秒）大而饱满。
- **小时不补前导零**（12h 制下 5 点显示 "5" 而非 "05"）。
- **AM/PM：小标，竖排在小时数字左侧**（截图中 "PM" 在 "5" 左边）。
- **时/分/秒之间用间距分组**，冒号弱化或省略（截图中几乎看不到冒号，靠留白分隔）。
- **顶部：日期+星期居中**，浅灰小字（如 "Oct 9, 2021  Sat"）。
- **底部：签名居中**，灰色小字，略小于日期（如 "Stay hungry, Stay foolish"）。
- **整体：垂直居中、大量留白、极简、克制**。无多余装饰线框。
- 右侧是 iOS 桌面小组件（彩色日历/时钟组件）—— 属 v2，本次不做。

### 由参考图修订的设计决策
- 默认/主推主题改为这套「纯黑+白色圆润粗体数字」高对比方案（替代旧的棕色），其余预设主题作为备选。
- v1 重做优先把这**一套默认主题做到接近参考图的精致度**，再扩展其他配色。
- 数字字形需要足够粗圆才有质感，考虑内置一个 heavy/rounded 字体而非系统默认 sans。

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*

## 2026-06-18 Video Reference Comparison

Reference video: `D:\binbi\Videos\屏幕录制\屏幕录制 2026-06-18 203444.mp4`.
Current app video: `D:\binbi\Documents\xwechat_files\wxid_3pf3ttkf9ys722_c041\temp\RWTemp\2026-06\9e20f478899dc29eb19741386f9343c8\ba1b4e8e603667ed093a16c704090a91.mp4`.

Key visual findings:
- The reference iPad design feels more polished because the clock reads as a compact poster-like composition: date, cards, and signature are grouped around one center.
- The current Android version is functionally close but visually too sparse: the clock spreads too far across the screen, the signature is too dim, and the metadata does not feel integrated with the card group.
- The reference cards have stronger physical presence: charcoal face, visible edge weight, darker hinge, and controlled highlight. The current cards read more like flat Compose rectangles with a middle line.
- The reference digits feel heavier and brighter. The current digits are readable but not forceful enough, so the card does not feel premium.
- The current video shows a right-side system bar affordance, which breaks the full-screen black-stage clock illusion.

Implementation direction:
- Keep the current architecture of one card per time unit with independently flipping digits.
- Tune ClassicBlack first; do not spend this pass polishing every alternate preset.
- Add edge shadow, seam shadow, bevel, and top highlight through theme-driven parameters rather than hard-coded one-off colors.
- Keep shadow/highlight math in pure functions so unit tests can cover the non-visual parts.

## 2026-06-18 User Clarification After First Polish Pass

The intended reference look is simpler than the initial polish pass:
- Date should read like `2022年8月25日 星期四`, with the date and weekday on one centered line.
- The date-to-clock distance from the current implementation is acceptable and should be preserved.
- Time cards should use a mostly solid gray face with large white digits.
- The time cards should be wider overall; avoid a narrow/tall or visually cramped card feel.
- Bottom signature text is acceptable and should not be reworked in this pass.

Follow-up clarification:
- The card gray should be a plain neutral gray, not a tinted or layered gray.
- Remove extra card color treatment from the default look: no visible edge tint, bevel, top highlight, or added shadow color beyond the necessary flip seam.
- Make each time card wider again; the user is optimizing for a broad reference-card shape.
- After reviewing the user's current screenshot, the remaining mismatch is not just total clock width: the digits read too narrow and too far apart inside each unit. The next pass should widen the digit glyph rendering and reduce the visually skinny Android-default feel.
