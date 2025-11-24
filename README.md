
# kmk's LexRead (Gemini Floating Translator)

A lightweight, floating translation widget powered by Google Gemini AI. Select text on any page to instantly translate it.

**New:** Supports Manual Paste and Copy!

---

## 📖 User Guide / 用户指南
Please refer to [USER_GUIDE.md](./USER_GUIDE.md) for a visual guide on the interface.
请参阅 [USER_GUIDE.md](./USER_GUIDE.md) 获取界面的可视化指南。

---

## Features / 功能

*   **Instant Translation**: Select text to translate immediately.
*   **Manual Input**: Type or Paste (Ctrl+V) text directly into the source area.
*   **Manual Copy**: Right-click the translation area to copy result.
*   **Powered by Gemini**: Uses Gemini 2.5 Flash (Fast) or Gemini 3 Pro (Precise).
*   **Resizable & Draggable**: Floating window with a split-pane layout.
*   **Customizable**: Change themes (Mint, Rose, Dark, etc.), text sizes, and colors.

---

## 📦 Packaging as EXE / 打包为 EXE

The project is now fully configured for Electron packaging.
本项目已配置好 Electron 打包流程。

### 1. Install Dependencies / 安装依赖
```bash
npm install
```

### 2. Build EXE / 构建 EXE
```bash
npm run build
```

The executable file will be generated in the `dist-electron` folder.
生成的可执行文件将位于 `dist-electron` 文件夹中。

### Development / 开发模式
To run locally in development mode:
如需在本地开发模式下运行：
```bash
npm run dev
# In a separate terminal / 在另一个终端:
npm start
```
