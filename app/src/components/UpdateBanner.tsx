interface Props {
  latestVersion: string;
  downloadUrl: string;
  onDismiss: () => void;
}

export default function UpdateBanner({ latestVersion, downloadUrl, onDismiss }: Props) {
  return (
    <div className="update-banner">
      <span>
        A new version <strong>{latestVersion}</strong> is available!
      </span>
      <div className="update-actions">
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary update-btn"
        >
          Download
        </a>
        <button className="btn-text" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
