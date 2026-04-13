interface Props {
  onExport: (format: string) => void;
  onCopy: () => void;
  disabled: boolean;
}

export default function ExportBar({ onExport, onCopy, disabled }: Props) {
  return (
    <section className="export-bar">
      <button className="btn btn-secondary" onClick={onCopy} disabled={disabled}>
        Copy to Clipboard
      </button>
      <button className="btn btn-secondary" onClick={() => onExport("txt")} disabled={disabled}>
        Save as TXT
      </button>
      <button className="btn btn-secondary" onClick={() => onExport("json")} disabled={disabled}>
        Save as JSON
      </button>
      <button className="btn btn-secondary" onClick={() => onExport("srt")} disabled={disabled}>
        Save as SRT
      </button>
      <button className="btn btn-secondary" onClick={() => onExport("markdown")} disabled={disabled}>
        Save as Markdown
      </button>
    </section>
  );
}
