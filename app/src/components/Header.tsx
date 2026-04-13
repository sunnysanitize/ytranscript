interface Props {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Header({ darkMode, onToggleDark }: Props) {
  return (
    <header className="header">
      <div className="header-top">
        <div />
        <div className="header-center">
          <h1>YTranscripts</h1>
          <p className="tagline">Grab YouTube transcripts in a few clicks</p>
        </div>
        <button
          className="dark-toggle"
          onClick={onToggleDark}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "\u2600" : "\u263E"}
        </button>
      </div>
    </header>
  );
}
