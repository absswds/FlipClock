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
- 未截图/未浏览实际 UI，仅通过 WebFetch 抓取的 App Store 文字描述了解参考软件功能列表（无视觉细节，需要用户后续补充截图/视频供动画质感比对，尤其是 Phase 4 翻页动画调试阶段）。

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
