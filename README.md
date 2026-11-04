# Visor Flow

**A Windows desktop voice-to-text app with Gemini-powered cleanup.** Dictate using a global shortcut, then paste the cleaned transcript into the app you were using.

Visor Flow is an independent open-source project inspired by voice-first writing tools. It is not affiliated with Wispr Flow.

## Windows quick start

**Requirements:** Windows 10/11 (64-bit), Git, and Node.js 20.19+ (Node 22 LTS or Node 24 is recommended). npm is included with Node.js. You do not need to install Electron, Python, Visual Studio Build Tools, or a separate paste utility.

1. Open PowerShell in the folder where you want the project.
2. If you already cloned an older copy, update it first with `git pull` from inside that folder. Do not run `git clone` over an existing folder.
3. Run:

```powershell
git clone https://github.com/vamshicodingmt-gif/Visor-flow.git
cd Visor-flow
npm install
npm rebuild electron
npm start
```

**The Visor Flow desktop window should open.** `npm start` launches Electron directly; it does not run the old terminal Gemini bootstrap. `npm rebuild electron` ensures Electron's Windows executable is downloaded even if a previous npm install skipped its install script. The first launch does not ask for API keys in the terminal. Enter both keys inside the app's Settings section.

If PowerShell says `npm` is not recognized, close and reopen PowerShell after installing Node.js. Confirm with `node -v` and `npm -v`.

## First-time setup inside the app

1. Create an OpenAI API key at https://platform.openai.com/api-keys and save it under **OpenAI API key**.
2. Create a Gemini API key at https://aistudio.google.com/app/apikey. Paste it under **Gemini API key**, then choose **Verify & save**.
3. Allow microphone access when Windows asks.
4. Click **Start dictation**, speak, and click **Stop & transcribe**.

The global shortcut is **Ctrl + Shift + Space**. The app copies the final transcript and attempts to paste it into the previously active app. If automatic paste is blocked, use **Copy text**.

API keys are credentials, not software dependencies. OpenAI is used for audio transcription; Gemini 3.1 Flash-Lite cleans up punctuation and obvious grammar. Audio is sent to OpenAI and transcript text is sent to Google.

## Build a Windows installer

From the project folder:

```powershell
npm run dist -- --win nsis
```

The installer is written to `release/Visor-Flow-Setup-<version>.exe`. The installer is configured to create a Start Menu entry and a desktop shortcut. The packaged app includes Electron, so users installing the generated app do not need Node.js or Git.

## Supported Node.js versions

The project supports Node.js **20.19 or newer**, including current 22 LTS and 24 releases. This is a supported-version range, not a promise that every historical Node.js release works. Electron bundles its own Node runtime for the desktop application.

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install project dependencies |
| `npm start` | Open the desktop app |
| `npm run setup-gemini` | Open the app to update/verify the Gemini key in Settings |
| `npm test` | Run JavaScript syntax checks |
| `npm run dist -- --win nsis` | Build the Windows installer |

## Platform notes

- Windows automatic paste uses built-in PowerShell/.NET functionality; no extra paste utility is required.
- macOS may require Accessibility permission for simulated paste.
- Linux automatic paste may require `xdotool`; Wayland can restrict simulated keyboard input.
- Microphone access must be allowed by the operating system.
- The OpenAI and Gemini APIs require valid keys and may incur provider charges or rate limits.

## Privacy and security

- Audio recordings are sent to OpenAI for transcription.
- Transcript text is sent to Google Gemini for refinement.
- The Gemini key is encrypted with Electron `safeStorage` using the operating system's secure-storage backend. If secure storage is unavailable, Visor Flow refuses to save the key in plaintext.
- The OpenAI key is stored in local Electron settings.
- Final text is copied to the system clipboard.
- Visor Flow does not operate its own backend server.

Do not dictate passwords, payment details, or sensitive information unless you are comfortable sending the audio and transcript to the configured providers.

## License

MIT. See [LICENSE](LICENSE).
