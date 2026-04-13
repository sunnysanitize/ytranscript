# YTranscripts

YTranscripts is a desktop app for grabbing YouTube transcripts with a clean, simple interface that anyone can use.

The goal is to turn this project into a downloadable app for **macOS** and **Windows**, not just a script for developers. A user should be able to paste a YouTube link, choose a transcript format, preview the result, and export it in a few clicks.

## Product Vision

YTranscripts should feel like a lightweight productivity app:

- Paste a YouTube URL and fetch the transcript instantly
- Preview the transcript in a readable editor-style layout
- Search inside transcripts quickly
- Reopen recent transcripts from local history
- Export as `TXT`, `JSON`, `SRT`, `Markdown`, or copy directly to clipboard
- Show available languages when a video has multiple transcript tracks
- Keep everything local and fast with no account required

The experience should be friendly for non-technical users, including students, researchers, content creators, journalists, and teams doing video analysis.

## What The App Should Include

### Core Features

- URL input with automatic YouTube video ID detection
- Transcript fetching for public YouTube videos
- Support for both manual and auto-generated captions
- Language picker when multiple transcript options exist
- Transcript search with instant keyword matching
- Local history for recently opened and exported transcripts
- Export options for `TXT`, `JSON`, `SRT`, and `Markdown`
- One-click copy to clipboard
- Clear error states for unavailable transcripts or invalid links

### Nice User Interface

The app should not look like a developer tool. It should feel polished and easy to trust.

Recommended UI sections:

1. **Header**
   Product name, short tagline, and app status
2. **Input Panel**
   YouTube URL field, fetch button, and language selection
3. **Transcript Preview**
   Scrollable transcript viewer with timestamps, search, and clean typography
4. **Export Actions**
   Copy, save as text, save as JSON, save as SRT, save as Markdown
5. **History Panel**
   Recent transcripts, recent exports, and quick reopen actions
6. **Feedback Area**
   Loading state, success messages, and helpful error messages

Recommended design direction:

- Spacious layout with strong readability
- Large URL input and obvious primary action
- Soft panel-based interface rather than raw form fields
- Timestamp chips or side markers for easier scanning
- Responsive window layout that still looks good on smaller laptops

## Target Platforms

The app should be packaged for:

- **macOS**: downloadable `.dmg`
- **Windows**: downloadable `.exe` installer

This project should eventually support a simple release flow where a user can download the app from GitHub Releases and install it like a normal desktop application.

## Recommended Tech Direction

To make this a real cross-platform desktop app, the best direction is:

- **Frontend UI**: React + TypeScript
- **Desktop shell**: Tauri
- **Transcript logic**: Python service or Rust-native integration
- **Transcript source**: `youtube-transcript-api`

### Why this direction

- **Tauri** gives us a modern desktop app with a smaller install size than Electron
- **React** makes it easier to build a polished, maintainable interface
- **Python** lets us reuse the transcript-fetching ecosystem quickly for the first version

If we want the fastest path to a real downloadable app, we can build the UI in React, wrap it with Tauri, and call the transcript logic through a local command bridge.

## Proposed App Flow

1. User opens YTranscripts
2. User pastes a YouTube URL
3. App validates the link
4. App fetches available transcript tracks
5. User previews transcript content
6. User searches, reviews, or reopens from history
7. User exports or copies the result

## Example User Experience

### Home Screen

- App title and short subtitle
- Large paste field for YouTube URL
- Primary button: `Get Transcript`
- Small helper text explaining that only public videos with captions are supported

### Results Screen

- Video title and selected language
- Transcript displayed in readable blocks
- Search bar for finding words or phrases in the transcript
- Optional timestamps toggle
- Export buttons pinned in a clear action bar
- Recent transcript history accessible from a side panel or drawer

### Error Handling

Errors should feel human and helpful, for example:

- `This video does not have a public transcript available.`
- `That link does not look like a valid YouTube video URL.`
- `We could not reach YouTube right now. Please try again in a moment.`

## Suggested Project Structure

```text
ytranscripts/
├── app/
│   ├── src/                 # React UI
│   ├── public/
│   └── package.json
├── desktop/
│   └── src-tauri/           # Tauri config and native packaging
├── backend/
│   ├── transcript_service.py
│   ├── formats.py
│   └── requirements.txt
├── assets/
│   ├── icon.icns
│   ├── icon.ico
│   └── screenshots/
├── README.md
└── LICENSE
```

## MVP Roadmap

### Phase 1: Working Desktop Prototype

- Build the desktop shell
- Add URL input and fetch action
- Fetch transcript text successfully
- Show transcript preview
- Add transcript search
- Export to `TXT` and `JSON`

### Phase 2: Polished User App

- Better visual design
- Loading states and empty states
- Language selection
- Local history for recent transcripts
- Export to `SRT`
- Export to `Markdown`
- Clipboard copy
- App icon, installer, and release builds

### Phase 3: Strong Public Release

- Batch processing
- Timestamp jump/click behavior
- Preferences window
- Better filtering and management for transcript history

## Development Goals

This project should optimize for:

- Simple setup for contributors
- Clean UI for non-technical users
- Reliable cross-platform packaging
- Local-first behavior
- Clear separation between UI and transcript-fetching logic
- Strong everyday workflow features before any AI layer

## Packaging Goals

For public releases, the app should produce:

- `YTranscripts.dmg` for macOS
- `YTranscripts-Setup.exe` for Windows

Each release should include:

- App icon
- Version number
- Basic install flow
- Release notes

## Limitations

- Only works for videos with available public transcripts
- Auto-generated transcripts may contain mistakes
- Internet connection is required
- Availability depends on YouTube transcript access

## Product Direction

This app should focus on practical workflow features first:

- Fetch transcripts reliably
- Search within transcripts
- Save local history
- Export in multiple useful formats

Smart or AI features are intentionally out of scope for the early versions. The goal is to make YTranscripts excellent as a clean, dependable desktop tool before expanding beyond that.

## What This README Now Represents

This project is no longer framed as “just a Python CLI script.” The intended direction is a **real desktop application** with a strong UI and installable builds for regular users.

The next implementation step is to actually scaffold the app around that direction:

1. Create the React frontend
2. Wrap it with Tauri
3. Connect transcript fetching logic
4. Package installers for macOS and Windows

## Status

Current state: concept and planning stage.

Target state: polished desktop app for downloading and exporting YouTube transcripts on macOS and Windows.
