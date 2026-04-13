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
          <h1><span className="title-y">Y</span><span className="title-rest">Transcripts</span></h1>
          <p className="tagline">Every word from every video, instantly yours</p>
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
