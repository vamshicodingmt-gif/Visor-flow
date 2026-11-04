#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const readline = require("node:readline/promises");

const MODEL = "gemini-3.1-flash-lite";
const KEY_FILE = path.join(getUserDataPath(), "gemini-key.enc");

function getUserDataPath() {
  if (process.platform === "win32") return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "visor-flow");
  if (process.platform === "darwin") return path.join(os.homedir(), "Library", "Application Support", "visor-flow");
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "visor-flow");
}

async function validateKey(key) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Reply with exactly VISOR_OK." }] }],
      generationConfig: { maxOutputTokens: 12 }
    }),
    signal: AbortSignal.timeout(20000)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `Google API returned HTTP ${response.status}`;
    throw new Error(message);
  }
  const text = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
  if (!text) throw new Error("Google accepted the request but returned no text.");
}

async function main() {
  const forceSetup = process.argv.includes("--setup");
  let key;

  if (forceSetup || !fs.existsSync(KEY_FILE)) {
    if (!process.stdin.isTTY) {
      console.error("Gemini API key setup needs an interactive terminal. Run: npm run setup-gemini");
      process.exit(1);
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      console.log("\nVisor Flow — Gemini setup");
      console.log("Get a key from https://aistudio.google.com/app/apikey");
      key = (await rl.question("Enter your Gemini API key: ")).trim();
    } finally {
      rl.close();
    }
    if (!key) {
      console.error("No key entered. Setup cancelled.");
      process.exit(1);
    }
    console.log("Checking your Gemini API key…");
    try {
      await validateKey(key);
      console.log("Gemini API key verified.");
    } catch (error) {
      console.error(`Gemini key validation failed: ${error.message}`);
      process.exit(1);
    }
  }

  const electronPath = require("electron");
  if (!electronPath || typeof electronPath !== "string") {
    console.error("Electron is not installed. Run npm install first.");
    process.exit(1);
  }

  const child = spawn(electronPath, ["."], {
    stdio: "inherit",
    env: { ...process.env, ...(key ? { VISOR_GEMINI_API_KEY: key } : {}) }
  });
  child.on("error", error => {
    console.error("Could not launch Visor Flow:", error.message);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exitCode = code ?? 0;
  });
}

main().catch(error => {
  console.error("Visor Flow startup failed:", error.message);
  process.exit(1);
});
