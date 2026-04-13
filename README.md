# YTranscripts

A lightweight desktop app for fetching, searching, and exporting YouTube video transcripts. Built with Tauri, React, and Python.

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
- Python 3.10+

### Setup

```bash
# Clone the repo
git clone https://github.com/sunnyzhangdev/ytranscripts.git
cd ytranscripts

# Install Python dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

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
│   │   ├── src/lib.rs        # Commands that invoke the Python backend
│   │   └── tauri.conf.json
│   └── package.json
├── backend/
│   ├── transcript_service.py # Transcript fetching CLI
│   ├── formats.py            # TXT, JSON, Markdown exporters
│   └── requirements.txt
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri v2 (Rust) |
| Frontend | React + TypeScript + Vite |
| Backend | Python + youtube-transcript-api |
| Styling | Custom CSS (brutalist theme) |

## Limitations

- Only works with public videos that have captions enabled
- Auto-generated transcripts may contain errors
- Requires an internet connection

## License

MIT
