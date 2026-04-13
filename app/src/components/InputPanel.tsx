import { useState } from "react";
import type { TranscriptTrack } from "../types";

interface Props {
  onFetch: (url: string, language: string) => void;
  loading: boolean;
  tracks: TranscriptTrack[];
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export default function InputPanel({
  onFetch,
  loading,
  tracks,
  selectedLanguage,
  onLanguageChange,
}: Props) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onFetch(url.trim(), selectedLanguage);
    }
  };

  return (
    <section className="input-panel">
      <form onSubmit={handleSubmit}>
        <div className="url-row">
          <input
            type="text"
            className="url-input"
            placeholder="Paste a YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !url.trim()}>
            {loading ? "Fetching..." : "Get Transcript"}
          </button>
        </div>
        <p className="helper-text">
          Only public videos with captions are supported
        </p>
      </form>
      {tracks.length > 1 && (
        <div className="language-picker">
          <label>Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {tracks.map((t) => (
              <option key={t.language_code} value={t.language_code}>
                {t.language} {t.is_generated ? "(auto)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
}
