import { useState, useMemo } from "react";
import type { TranscriptSegment } from "../types";

interface Props {
  segments: TranscriptSegment[];
  showTimestamps: boolean;
  onToggleTimestamps: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TranscriptView({
  segments,
  showTimestamps,
  onToggleTimestamps,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return segments;
    const q = search.toLowerCase();
    return segments.filter((s) => s.text.toLowerCase().includes(q));
  }, [segments, search]);

  const highlightMatch = (text: string) => {
    if (!search.trim()) return text;
    const q = search.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <section className="transcript-view">
      <div className="transcript-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search transcript..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="timestamp-toggle">
          <input
            type="checkbox"
            checked={showTimestamps}
            onChange={onToggleTimestamps}
          />
          Timestamps
        </label>
        <span className="segment-count">
          {filtered.length} / {segments.length} segments
        </span>
      </div>
      <div className="transcript-content">
        {filtered.map((seg, i) => (
          <div key={i} className="segment">
            {showTimestamps && (
              <span className="timestamp">{formatTime(seg.start)}</span>
            )}
            <span className="segment-text">{highlightMatch(seg.text)}</span>
          </div>
        ))}
        {filtered.length === 0 && search && (
          <p className="no-results">No matches found for "{search}"</p>
        )}
      </div>
    </section>
  );
}
