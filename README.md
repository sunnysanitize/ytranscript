# YTranscripts

A lightweight desktop app for fetching, searching, and exporting YouTube video transcripts. Built with Tauri, React, and Rust.

## Features

- Paste any YouTube URL and fetch the transcript instantly
- Language picker when multiple transcript tracks are available
- Search within transcripts with highlighted matches
- Export as TXT, JSON, or Markdown
- Copy transcript to clipboard
- Local history of recently fetched transcripts
- Dark mode
- Auto-update notifications via GitHub Releases

## Download

Grab the latest release for your platform:

- **macOS**: `YTranscripts.dmg`
- **Windows**: `YTranscripts-Setup.exe`

See [Releases](https://github.com/sunnyzhangdev/ytranscripts/releases) for downloads.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/)

### Setup

```bash
# Clone the repo
git clone https://github.com/sunnyzhangdev/ytranscripts.git
cd ytranscripts

# Install frontend dependencies
cd app
npm install

# Run in dev mode
npx tauri dev
```

### Build

```bash
cd app
npx tauri build
```

Bundles are output to `app/src-tauri/target/release/bundle/`.

## Project Structure

```
ytranscripts/
├── app/
│   ├── src/                  # React + TypeScript frontend
│   │   ├── components/       # UI components
│   │   ├── api.ts            # Tauri command wrappers
│   │   ├── history.ts        # Local history (localStorage)
│   │   ├── updater.ts        # GitHub release update checker
│   │   └── types.ts
│   ├── src-tauri/            # Tauri (Rust) desktop shell
│   │   ├── src/lib.rs        # Native commands for transcripts, titles, and exports
│   │   └── tauri.conf.json
│   └── package.json
├── backend/                  # Legacy Python prototype, not used in packaged builds
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri v2 (Rust) |
| Frontend | React + TypeScript + Vite |
| Transcript client | Rust + `yt-transcript-rs` |
| Styling | Custom CSS (brutalist theme) |

## macOS Release Signing

To ship a macOS build that does not trigger Gatekeeper warnings, the release workflow expects these GitHub Actions secrets:

- `APPLE_CERTIFICATE`: base64-encoded exported `.p12` for a `Developer ID Application` certificate
- `APPLE_CERTIFICATE_PASSWORD`: password used for that `.p12`
- `KEYCHAIN_PASSWORD`: temporary CI keychain password
- `APPLE_ID`: Apple ID email used for notarization
- `APPLE_PASSWORD`: Apple app-specific password
- `APPLE_TEAM_ID`: Apple Developer team ID

Without these secrets, macOS releases will build but will not be signed and notarized properly.

## Limitations

- Only works with public videos that have captions enabled
- Auto-generated transcripts may contain errors
- Requires an internet connection

## License

MIT
