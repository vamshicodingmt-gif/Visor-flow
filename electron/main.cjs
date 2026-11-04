const { app, BrowserWindow, globalShortcut, ipcMain, clipboard } = require("electron");
const path = require("node:path");
const os = require("node:os");
const { execFile } = require("node:child_process");
const Store = require("electron-store");

const store = new Store({ name: "visor-flow-settings" });
let mainWindow;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 390,
    height: 560,
    minWidth: 340,
    minHeight: 460,
    title: "Visor Flow",
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    backgroundColor: "#101114",
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../src/index.html"));
  mainWindow.on("closed", () => { mainWindow = null; });
}

function sendPasteShortcut() {
  const platform = process.platform;
  if (platform === "win32") {
    execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"], () => {});
  } else if (platform === "darwin") {
    execFile("osascript", ["-e", 'tell application "System Events" to keystroke "v" using {command down}'], () => {});
  } else {
    execFile("xdotool", ["key", "--clearmodifiers", "ctrl+v"], () => {});
  }
}

function registerShortcut() {
  const shortcut = process.platform === "darwin" ? "Command+Shift+Space" : "Control+Shift+Space";
  globalShortcut.register(shortcut, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("shortcut-toggle");
    }
  });
  if (!globalShortcut.isRegistered(shortcut)) {
    console.warn("Could not register the Visor Flow global shortcut:", shortcut);
  }
}

ipcMain.handle("settings:get-key", () => store.get("openaiApiKey", ""));
ipcMain.handle("settings:set-key", (_event, key) => {
  if (typeof key !== "string" || key.length > 300) throw new Error("Invalid API key.");
  store.set("openaiApiKey", key.trim());
  return true;
});

ipcMain.handle("transcribe", async (_event, audioBytes, mimeType) => {
  const apiKey = store.get("openaiApiKey", "");
  if (!apiKey) throw new Error("Add your OpenAI API key in Settings first.");
  if (!(audioBytes instanceof ArrayBuffer) && !ArrayBuffer.isView(audioBytes)) {
    throw new Error("No audio recording was received.");
  }

  const bytes = audioBytes instanceof ArrayBuffer
    ? new Uint8Array(audioBytes)
    : new Uint8Array(audioBytes.buffer, audioBytes.byteOffset, audioBytes.byteLength);
  if (!bytes.byteLength) throw new Error("The recording is empty.");

  const extension = mimeType && mimeType.includes("ogg") ? "ogg"
    : mimeType && mimeType.includes("mp4") ? "mp4"
    : mimeType && mimeType.includes("wav") ? "wav" : "webm";
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mimeType || "audio/webm" }), `recording.${extension}`);
  form.append("model", "gpt-4o-mini-transcribe");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `Transcription failed (HTTP ${response.status}).`);
  }
  const transcript = String(data.text || "").trim();
  if (!transcript) throw new Error("No speech was detected.");
  clipboard.writeText(transcript);

  // Hide the overlay so the target application can regain focus before paste.
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
  setTimeout(() => sendPasteShortcut(), 350);
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.webContents.send("transcription-complete", transcript);
    }
  }, 700);
  return { text: transcript };
});

app.whenReady().then(() => {
  createWindow();
  registerShortcut();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else if (mainWindow) mainWindow.show();
  });
});

app.on("before-quit", () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin" || isQuitting) app.quit();
});
