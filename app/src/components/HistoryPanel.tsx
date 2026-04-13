import type { HistoryEntry } from "../types";

interface Props {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (videoId: string) => void;
  onClear: () => void;
}

export default function HistoryPanel({
  history,
  onSelect,
  onRemove,
  onClear,
}: Props) {
  if (history.length === 0) {
    return (
      <aside className="history-panel">
        <h3>Recent Transcripts</h3>
        <p className="empty-state">No history yet</p>
      </aside>
    );
  }

  return (
    <aside className="history-panel">
      <div className="history-header">
        <h3>Recent Transcripts</h3>
        <button className="btn btn-text" onClick={onClear}>
          Clear
        </button>
      </div>
      <ul className="history-list">
        {history.map((entry) => (
          <li key={entry.videoId} className="history-item">
            <button
              className="history-link"
              onClick={() => onSelect(entry)}
              title={entry.url}
            >
              <span className="history-title">{entry.title}</span>
              <span className="history-meta">
                {entry.language} &middot;{" "}
                {new Date(entry.fetchedAt).toLocaleDateString()}
              </span>
            </button>
            <button
              className="btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(entry.videoId);
              }}
              title="Remove"
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
