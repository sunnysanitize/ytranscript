"""
YTranscripts backend service.
Fetches YouTube transcripts and returns them as JSON via stdout.
Invoked by the Tauri shell as a sidecar command.
"""

import json
import re
import sys
import urllib.request
import urllib.parse
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)
from formats import to_txt, to_json, to_srt, to_markdown


def extract_video_id(url: str) -> str | None:
    patterns = [
        r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/v/|youtube\.com/shorts/)([a-zA-Z0-9_-]{11})",
        r"^([a-zA-Z0-9_-]{11})$",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def fetch_video_title(video_id: str) -> str:
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            return data.get("title", video_id)
    except Exception:
        return video_id


def list_transcripts(video_id: str) -> list[dict]:
    ytt_api = YouTubeTranscriptApi()
    transcript_list = ytt_api.list(video_id)
    result = []
    for t in transcript_list:
        result.append(
            {
                "language": t.language,
                "language_code": t.language_code,
                "is_generated": t.is_generated,
            }
        )
    return result


def fetch_transcript(video_id: str, language: str = "en") -> list[dict]:
    ytt_api = YouTubeTranscriptApi()
    transcript = ytt_api.fetch(video_id, languages=[language])
    return [
        {
            "text": snippet.text,
            "start": snippet.start,
            "duration": snippet.duration,
        }
        for snippet in transcript.snippets
    ]


def handle_command(command: str, args: dict) -> dict:
    try:
        if command == "extract_id":
            video_id = extract_video_id(args.get("url", ""))
            if video_id is None:
                return {"error": "That link does not look like a valid YouTube video URL."}
            return {"video_id": video_id}

        elif command == "fetch_title":
            video_id = args.get("video_id", "")
            title = fetch_video_title(video_id)
            return {"title": title}

        elif command == "list_transcripts":
            video_id = args.get("video_id", "")
            transcripts = list_transcripts(video_id)
            return {"transcripts": transcripts}

        elif command == "fetch_transcript":
            video_id = args.get("video_id", "")
            language = args.get("language", "en")
            segments = fetch_transcript(video_id, language)
            return {"segments": segments}

        elif command == "export":
            segments = args.get("segments", [])
            fmt = args.get("format", "txt")
            if fmt == "txt":
                return {"content": to_txt(segments)}
            elif fmt == "json":
                return {"content": to_json(segments)}
            elif fmt == "srt":
                return {"content": to_srt(segments)}
            elif fmt == "markdown":
                return {"content": to_markdown(segments)}
            else:
                return {"error": f"Unknown format: {fmt}"}

        else:
            return {"error": f"Unknown command: {command}"}

    except TranscriptsDisabled:
        return {"error": "This video does not have a public transcript available."}
    except NoTranscriptFound:
        return {"error": "No transcript found for the selected language."}
    except VideoUnavailable:
        return {"error": "This video is unavailable or does not exist."}
    except Exception as e:
        return {"error": f"We could not reach YouTube right now. Please try again in a moment. ({e})"}


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)

    command = sys.argv[1]
    args = {}
    if len(sys.argv) > 2:
        try:
            args = json.loads(sys.argv[2])
        except json.JSONDecodeError:
            print(json.dumps({"error": "Invalid JSON arguments"}))
            sys.exit(1)

    result = handle_command(command, args)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
