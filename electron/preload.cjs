const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("visor", {
  getApiKey: () => ipcRenderer.invoke("settings:get-key"),
  geminiConfigured: () => ipcRenderer.invoke("settings:gemini-status"),
  saveGeminiKey: (key) => ipcRenderer.invoke("settings:set-gemini-key", key),
  saveApiKey: (key) => ipcRenderer.invoke("settings:set-key", key),
  transcribe: (audioBytes, mimeType) => ipcRenderer.invoke("transcribe", audioBytes, mimeType),
  onShortcutToggle: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("shortcut-toggle", listener);
    return () => ipcRenderer.removeListener("shortcut-toggle", listener);
  },
  onTranscriptionComplete: (callback) => {
    const listener = (_event, text) => callback(text);
    ipcRenderer.on("transcription-complete", listener);
    return () => ipcRenderer.removeListener("transcription-complete", listener);
  },
  minimize: () => ipcRenderer.invoke("window:hide")
});
