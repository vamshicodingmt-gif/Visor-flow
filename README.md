# Visor Flow

**A desktop voice-to-text app you control.** Dictate into your workflow with a global shortcut, transcription, and automatic paste into the app you were using.

Visor Flow is an independent, open-source project inspired by the convenience of voice-first writing tools. It is not affiliated with Wispr Flow.

> **Current MVP:** Electron desktop shell + OpenAI audio transcription. You supply your own OpenAI API key. Audio is sent to OpenAI's transcription API when you dictate; it is not processed locally in this MVP.

## Features

- Floating, compact desktop control window.
- Global shortcut: `Ctrl+Shift+Space` (Windows/Linux) or `Cmd+Shift+Space` (macOS) to start/stop dictation.
- Records microphone audio and transcribes it with OpenAI's `gpt-4o-mini-transcribe` model.
- Copies the transcript and pastes it into the previously focused app.
- Keeps your API key in local app settings (Electron store).
- Windows, macOS and Linux packaging configuration.

## Quick start (development)

Requirements: Node.js 20.19+ (or a current Node.js 22 LTS release), npm, and a microphone.

```bash
git clone https://github.com/vamshicodingmt-gif/Visor-flow.git
cd Visor-flow
npm install
npm start
```

The app opens as a small floating window. Paste an OpenAI API key into **Settings**, then save it. You can create an API key in the OpenAI developer dashboard.

## How to use

1. Launch Visor Flow.
2. Open **Settings** and add your OpenAI API key.
3. Return to the app where you want the words inserted.
4. Press `Ctrl+Shift+Space` (Windows/Linux) or `Cmd+Shift+Space` (macOS), or click **Start dictation**.
5. Speak naturally. Press the shortcut again or click **Stop & transcribe**.
6. Visor Flow transcribes the recording, copies the text, and attempts to paste it into the previously active app.

You can also click **Copy transcript** and paste manually if your operating system blocks simulated keyboard input.

## Build a desktop installer

`npm install` installs project dependencies; it does not install a desktop app or create a desktop shortcut by itself. Build an installer with:

```bash
npm run install-app
```

Or use `npm run dist`. Installers are written to the `release/` directory. On Windows, the NSIS installer creates Start Menu and desktop shortcuts. macOS produces a DMG and Linux produces AppImage/DEB packages. Platform packaging should be built on the target operating system for the most reliable result.

## Platform notes

- **Windows:** the app uses PowerShell to send Ctrl+V to the previously focused app. If that fails, use Copy transcript.
- **macOS:** grant Visor Flow Accessibility permission when macOS asks, so it can send the paste shortcut. You may need to enable it under System Settings → Privacy & Security → Accessibility.
- **Linux:** simulated paste uses `xdotool`; install it with your distribution's package manager. Wayland desktop environments may restrict global keyboard automation; manual copy/paste remains available.
- Microphone access must be allowed by the operating system.

## Privacy and security

- This MVP sends recorded audio to OpenAI for transcription. Review OpenAI's API terms and privacy documentation before use.
- Your API key is stored in Electron's local application settings. Do not share your app data folder or logs with other people.
- The transcript is placed on your system clipboard so it can be pasted into another application.
- Visor Flow does not run a project-owned server and does not upload recordings to a Visor Flow backend.
- Do not dictate passwords, payment details, or other sensitive information unless you are comfortable sending that audio to the configured transcription provider.

## Scripts

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm start` | Run the desktop app |
| `npm run dist` | Package the app for the current platform |
| `npm run install-app` | Alias for packaging an installer |

## Project layout

```text
Visor-flow/
├── electron/
│   ├── main.cjs
│   └── preload.cjs
├── src/
│   ├── index.html
│   ├── renderer.js
│   └── styles.css
├── assets/
│   └── icon.svg
├── package.json
├── .gitignore
└── LICENSE
```

## Roadmap

- [ ] Offline transcription option.
- [ ] Customizable shortcut and language selection.
- [ ] Transcript history and per-app formatting.
- [ ] More robust platform-specific paste integrations.
- [ ] Signed installers and automatic updates.

## License

MIT. See [LICENSE](LICENSE).
