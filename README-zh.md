# FlipClock

中文 | [English](./README.md)

[![在线体验](https://img.shields.io/badge/Web-在线体验-f38020?logo=cloudflarepages&logoColor=white)](https://flipclock-wpz.pages.dev/)
[![Android](https://img.shields.io/badge/Android-Jetpack%20Compose-3ddc84?logo=android&logoColor=white)](https://github.com/absswds/clock/releases)
[![版本](https://img.shields.io/github/v/release/absswds/clock?display_name=tag)](https://github.com/absswds/clock/releases)
[![测试](https://img.shields.io/badge/Tests-Vitest%20%2B%20JUnit-4b5563)](https://github.com/absswds/clock/actions)
[![许可](https://img.shields.io/badge/License-暂未选择-9ca3af)](./LICENSE)

一个偏安静、偏沉浸的翻页时钟项目，适合桌面、床头和专注场景。仓库同时包含 React/Vite 的网页版，以及 Kotlin + Jetpack Compose 的原生 Android 版，两端尽量保持一致的主题方向、核心模式和本地持久化体验。

**链接**

- [在线演示](https://flipclock-wpz.pages.dev/)
- [GitHub Releases](https://github.com/absswds/clock/releases)
- [Cloudflare Pages 地址](https://flipclock-wpz.pages.dev/)
- [英文 README](./README.md)

## 这个项目想做什么

FlipClock 想做的不是“功能很多的时钟工具箱”，而是“先把主时钟做得够大、够稳、够有质感”。所以主页面尽量保持干净，再把计时器、秒表、倒数日、专注模式、主题、时区、语言和默认签名这些能力放在外围。

当前公开主题保持精简，只保留和网页版一致的三套：

- `Paper Desk`
- `经典黑`
- `纯黑夜间`

## 功能一览

- 全屏翻页时钟，可切换是否显示秒
- 12 小时 / 24 小时制
- 默认签名随语言自动切换
- Web 与 Android 共用同一套主题方向
- 计时器、秒表、倒数日、专注模式
- Web 端使用浏览器本地缓存保存设置和倒数日
- Android 端使用 DataStore 保存设置和生产力数据
- 主时钟支持手动切换时区
- 网页版通过 Cloudflare Pages 自动部署

## 平台说明

**Web**

- React 19 + TypeScript + Vite + Vitest
- GitHub Actions 构建后发布到 Cloudflare Pages
- 更适合快速分享和验证视觉迭代

**Android**

- Kotlin + Jetpack Compose 原生实现
- APK 通过 GitHub Releases 发布
- 会针对小屏手机做布局收紧，而不是直接照搬桌面网页画布

## 开发方式

**Web**

```bash
cd web
npm install
npm run dev
```

常用命令：

```bash
npm run test
npm run lint
npm run build
```

**Android**

仓库目前保留了 `gradle/wrapper/gradle-wrapper.properties`，但没有提交 wrapper 脚本和 `gradle-wrapper.jar`。

可用 Android Studio，或者本地安装 Gradle 后执行：

```bash
gradle :app:testDebugUnitTest
gradle :app:assembleDebug
```

调试 APK 输出路径：`app/build/outputs/apk/debug/app-debug.apk`

## 发布

推送 `v*` 标签后，Release 工作流会自动上传：

- `flipclock-web-<tag>.zip`
- `flipclock-android-debug-<tag>.apk`

当前 Android 产物仍是 debug 签名的预览包；如果要正式分发，还需要补 release 签名和正式构建流程。

## 网页部署

[.github/workflows/deploy-web.yml](./.github/workflows/deploy-web.yml) 会在 GitHub Actions 里先跑测试，再构建 `web/dist`，最后发布到 Cloudflare Pages。

需要配置的仓库 Secret：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 灵感来源

这个项目参考的是“翻页时钟”这种更广义的视觉语言，而不是照搬某个特定 App 的源码、品牌或素材。目标是做出一个有自己主题体系、交互细节、发布流程和跨平台形态的原创实现。

## 目录结构

```text
.
|-- app/                    Android 应用源码
|-- web/                    React/Vite 网页版
|-- docs/project/           工作记录和进度笔记
|-- gradle/                 Gradle 版本目录与 wrapper 元数据
|-- .github/workflows/      发布与部署自动化
|-- README.md               英文版公开说明
`-- README-zh.md            中文版公开说明
```
