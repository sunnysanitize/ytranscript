"""Export format converters for transcript segments."""

import json


def _format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _format_timestamp_short(seconds: float) -> str:
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m}:{s:02d}"


def to_txt(segments: list[dict]) -> str:
    lines = []
    for seg in segments:
        ts = _format_timestamp_short(seg["start"])
        lines.append(f"[{ts}] {seg['text']}")
    return "\n".join(lines)


def to_json(segments: list[dict]) -> str:
    return json.dumps(segments, indent=2, ensure_ascii=False)


def to_srt(segments: list[dict]) -> str:
    lines = []
    for i, seg in enumerate(segments, 1):
        start = _format_timestamp(seg["start"])
        end = _format_timestamp(seg["start"] + seg["duration"])
        lines.append(str(i))
        lines.append(f"{start} --> {end}")
        lines.append(seg["text"])
        lines.append("")
    return "\n".join(lines)


def to_markdown(segments: list[dict]) -> str:
    lines = ["# Transcript", ""]
    for seg in segments:
        ts = _format_timestamp_short(seg["start"])
        lines.append(f"**[{ts}]** {seg['text']}  ")
    return "\n".join(lines)
