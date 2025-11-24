
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
*   **Character Count**: Real-time character counting for source and target text.

---

## Development / 开发

### ⚠️ Prerequisites (Crucial) / 前置条件 (重要)
**If you see "npm not recognized", you must install Node.js first!**
**如果你看到 "npm not recognized" 错误，请先安装 Node.js！**

1.  **Download Node.js**: Go to [nodejs.org](https://nodejs.org/) and download the **LTS** version.
2.  **Install**: Run the installer. Ensure "Add to PATH" is checked during installation.
3.  **Verify**: Open a new terminal (CMD or PowerShell) and type `node -v` and `npm -v`.

### Installation / 安装
```bash
npm install
```

### Running Locally / 本地运行
```bash
# You must set your API Key in your environment or .env file
export API_KEY="your_api_key_here"
npm start
```

---

## 📦 How to Package as .exe (Windows Executable)
## 📦 如何打包为 .exe (Windows 可执行文件)

Since this is a React web application, you need to wrap it using **Electron** to create a standalone `.exe` file.
因为这是一个 React Web 应用程序，你需要使用 **Electron** 将其封装，从而创建一个独立的 `.exe` 文件。

### Step 1: Install Electron Dependencies / 第一步：安装 Electron 依赖
Open your terminal in the project folder and run:
在项目文件夹的终端中运行：

```bash
npm install --save-dev electron electron-builder wait-on concurrently cross-env
npm install is-electron
```

### Step 2: Create Electron Entry File / 第二步：创建 Electron 入口文件
Create a new file named `public/electron.js`.
创建一个名为 `public/electron.js` 的新文件。

**Content for `public/electron.js`:**
**`public/electron.js` 的内容：**

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = import('electron-is-dev'); 

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true, // Hides the menu bar / 隐藏菜单栏
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../build/index.html')}`;
  win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Step 3: Update `package.json` / 第三步：修改 `package.json`

Open `package.json` and add/modify these sections:
打开 `package.json` 并添加/修改以下部分：

```json
{
  "name": "kmks-lexread",
  "version": "1.0.0",
  "main": "public/electron.js", 
  "homepage": "./",
  "author": "Your Name",
  "description": "Gemini Floating Translator",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "electron:dev": "concurrently \"cross-env BROWSER=none npm start\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "npm run build && electron-builder -w"
  },
  "build": {
    "appId": "com.kmk.lexread",
    "productName": "kmk's LexRead",
    "files": [
      "build/**/*",
      "node_modules/**/*",
      "public/electron.js"
    ],
    "directories": {
      "buildResources": "assets"
    },
    "win": {
      "target": "nsis",
      "icon": "public/favicon.ico"
    }
  }
}
```

### Step 4: Build the EXE / 第四步：构建 EXE

```bash
npm run electron:build
```

**Output**: Check the `dist` folder.
**输出**: 检查 `dist` 文件夹。