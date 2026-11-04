# Visor Flow

**A desktop voice-to-text app with Gemini-powered cleanup.** Dictate into your workflow with a global shortcut, then let a lightweight model clean up the transcript before it is pasted into the app you were using.

Visor Flow is an independent, open-source project inspired by voice-first writing tools. It is not affiliated with Wispr Flow.

## Features

- Floating desktop control window.
- Global shortcut: `Ctrl+Shift+Space` (Windows/Linux) or `Cmd+Shift+Space` (macOS).
- OpenAI audio transcription using `gpt-4o-mini-transcribe`.
- Gemini text refinement using **`gemini-3.1-flash-lite`**.
- Gemini corrects punctuation, capitalization, and obvious grammar while preserving the speaker's meaning, language, names, and numbers.
- Copies the final text and attempts to paste it into the previously active app.
- Gemini key is validated on setup and encrypted with Electron's `safeStorage` using the operating system's secure storage.
- OpenAI key remains in the app's local settings.

## Quick start

Requirements: Node.js 20.19+ (or current Node.js 22 LTS), npm, and a microphone. **Git is optional.**

### Windows (PowerShell 5.1 or newer) — Git not required

1. Install the current Node.js LTS from [nodejs.org](https://nodejs.org/en/download) (npm is included).
2. Open a new PowerShell window.
3. Run this one-line setup command:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force; Invoke-WebRequest "https://raw.githubusercontent.com/vamshicodingmt-gif/Visor-flow/main/quick-start-windows.ps1" -OutFile "$env:TEMP\visor-flow-setup.ps1"; & "$env:TEMP\visor-flow-setup.ps1"
```

The script downloads the project ZIP directly from GitHub, installs dependencies, and starts Visor Flow. It does not require Git and does not overwrite an existing `Visor-flow` folder. If Node.js is missing, it tells you where to install it.

### macOS / Linux or users who already have Git

```bash
git clone https://github.com/vamshicodingmt-gif/Visor-flow.git
cd Visor-flow
npm install
npm start
```

### First launch: Gemini API key

On the first `npm start`, Visor Flow asks in the terminal:

```text
Visor Flow — Gemini setup
Get a key from https://aistudio.google.com/app/apikey
Enter your Gemini API key:
```

Paste your key and press Enter. Visor Flow checks the key against Google's Gemini API using `gemini-3.1-flash-lite`. If validation succeeds, the app opens and the key is encrypted and saved in the operating system's app-data folder. The terminal does not ask again on normal launches.

To replace or validate a different Gemini key later:

```bash
npm run setup-gemini
```

If you launch an installed desktop build without using the terminal, you can also paste and verify the Gemini key in **Settings → Gemini API key** inside the app.

Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey). Gemini API access and billing/rate limits are controlled by Google.

## OpenAI transcription key

The OpenAI key is separate from the Gemini key. Open **Settings → OpenAI API key** in the app and save it. The app uses OpenAI's transcription endpoint to convert microphone audio to text; Gemini then refines that text.

## How to dictate

1. Start Visor Flow.
2. Add and save your OpenAI API key in Settings.
3. Confirm Gemini shows **CONNECTED**. If not, run `npm run setup-gemini` or enter the key in Settings.
4. Focus the app or text field where you want the words inserted.
5. Press `Ctrl+Shift+Space` (Windows/Linux) or `Cmd+Shift+Space` (macOS), or click **Start dictation**.
6. Speak, then press the shortcut again or click **Stop & transcribe**.
7. Visor Flow transcribes the audio, asks Gemini to clean up the transcript, copies the final text, and attempts to paste it into the previous app.

If Gemini is unavailable or returns an error, Visor Flow keeps the original OpenAI transcript and shows a warning. It does not discard the transcription.

## Build a desktop installer

`npm install` installs dependencies; it does not create a desktop shortcut by itself. Build an installer with:

```bash
npm run install-app
```

Or:

```bash
npm run dist
```

Installers are written to `release/`. The Windows NSIS installer is configured to create Start Menu and desktop shortcuts. macOS builds a DMG; Linux builds AppImage and DEB packages. Build on the target operating system for the most reliable packaging.

## Platform notes

- **Windows:** automatic paste uses PowerShell to send Ctrl+V.
- **macOS:** grant Accessibility permission to Visor Flow so it can send the paste shortcut.
- **Linux:** automatic paste uses `xdotool`; install it with your package manager. Wayland may restrict simulated keyboard input.
- Microphone access must be allowed by the operating system. Manual **Copy text** remains available if automatic paste is blocked.

## Privacy and security

- Audio recordings are sent to OpenAI for transcription.
- The resulting transcript text is sent to Google's Gemini API for refinement.
- The Gemini API key is encrypted using Electron `safeStorage` and the OS secure-storage backend. If secure storage is unavailable, Visor Flow refuses to save the key rather than writing it in plaintext.
- The OpenAI API key is stored in Electron Store's local settings. Protect your operating-system account and app-data directory.
- Final text is written to the system clipboard.
- Visor Flow does not operate its own backend server.

Do not dictate passwords, payment details, or sensitive information unless you are comfortable sending the audio and transcript to the configured providers. See [Google's Gemini API documentation](https://ai.google.dev/gemini-api/docs) and [OpenAI's API documentation](https://platform.openai.com/docs).

## Commands

| Command | Description |
| --- | --- |
| `npm install` | Install project dependencies |
| `npm test` | Check JavaScript syntax |
| `npm start` | First-run Gemini setup if needed, then launch the app |
| `npm run setup-gemini` | Replace and validate the Gemini API key |
| `npm run start:app` | Launch Electron directly (use Settings if Gemini is not configured) |
| `npm run dist` | Package the current platform |
| `npm run install-app` | Build the desktop installer |

## Project structure

```text
Visor-flow/
├── electron/
│   ├── main.cjs
│   └── preload.cjs
├── scripts/
│   └── launch.cjs
├── src/
│   ├── index.html
│   ├── renderer.js
│   └── styles.css
├── assets/
│   └── icon.svg
├── package.json
├── README.md
└── LICENSE
```

## License

MIT. See [LICENSE](LICENSE).
