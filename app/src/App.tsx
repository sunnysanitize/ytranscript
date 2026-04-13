import { useState, useEffect, useCallback } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import Header from "./components/Header";
import InputPanel from "./components/InputPanel";
import TranscriptView from "./components/TranscriptView";
import ExportBar from "./components/ExportBar";
import HistoryPanel from "./components/HistoryPanel";
import Feedback from "./components/Feedback";
import UpdateBanner from "./components/UpdateBanner";
import { checkForUpdate } from "./updater";
import {
  extractVideoId,
  listTranscripts,
  fetchTranscript,
  fetchTitle,
  exportTranscript,
} from "./api";
import {
  getHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
} from "./history";
import type {
  TranscriptSegment,
  TranscriptTrack,
  HistoryEntry,
} from "./types";
import "./App.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [tracks, setTracks] = useState<TranscriptTrack[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [currentVideoId, setCurrentVideoId] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("ytranscripts_dark") === "true";
  });
  const [feedback, setFeedback] = useState({
    message: "",
    type: "info" as "info" | "success" | "error",
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [update, setUpdate] = useState<{ version: string; url: string } | null>(null);

  useEffect(() => {
    setHistory(getHistory());
    checkForUpdate().then((info) => {
      if (info?.hasUpdate) {
        setUpdate({ version: info.latestVersion, url: info.downloadUrl });
      }
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("ytranscripts_dark", String(darkMode));
  }, [darkMode]);

  const showFeedback = (
    message: string,
    type: "info" | "success" | "error"
  ) => {
    setFeedback({ message, type });
    if (type !== "error") {
      setTimeout(() => setFeedback({ message: "", type: "info" }), 3000);
    }
  };

  const handleFetch = useCallback(async (url: string, language: string) => {
    setLoading(true);
    setLoadingStep("Validating URL...");
    setFeedback({ message: "", type: "info" });
    setSegments([]);

    try {
      const idResult = await extractVideoId(url);
      if (idResult.error || !idResult.video_id) {
        showFeedback(idResult.error || "Invalid YouTube URL", "error");
        setLoading(false);
        return;
      }

      const videoId = idResult.video_id;
      setCurrentVideoId(videoId);
      setCurrentUrl(url);

      setLoadingStep("Fetching video info...");

      // Fetch title and transcripts in parallel
      const [titleResult, trackResult] = await Promise.all([
        fetchTitle(videoId),
        listTranscripts(videoId),
      ]);

      const title = titleResult.title || videoId;
      setCurrentTitle(title);

      if (trackResult.error) {
        showFeedback(trackResult.error, "error");
        setLoading(false);
        return;
      }

      const availableTracks = trackResult.transcripts || [];
      setTracks(availableTracks);

      let lang = language;
      if (availableTracks.length > 0) {
        const hasRequested = availableTracks.some(
          (t) => t.language_code === language
        );
        if (!hasRequested) {
          lang = availableTracks[0].language_code;
        }
      }
      setSelectedLanguage(lang);

      setLoadingStep("Downloading transcript...");

      const transcriptResult = await fetchTranscript(videoId, lang);
      if (transcriptResult.error) {
        showFeedback(transcriptResult.error, "error");
        setLoading(false);
        return;
      }

      const segs = transcriptResult.segments || [];
      setSegments(segs);

      const entry: HistoryEntry = {
        videoId,
        url,
        title,
        language: lang,
        fetchedAt: new Date().toISOString(),
        segments: segs,
      };
      addToHistory(entry);
      setHistory(getHistory());

      showFeedback(`Loaded ${segs.length} segments`, "success");
    } catch (err) {
      showFeedback(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred",
        "error"
      );
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }, []);

  const handleLanguageChange = useCallback(
    (lang: string) => {
      setSelectedLanguage(lang);
      if (currentVideoId) {
        handleFetch(currentUrl, lang);
      }
    },
    [currentVideoId, currentUrl, handleFetch]
  );

  const handleExport = useCallback(
    async (format: string) => {
      try {
        const result = await exportTranscript(segments, format);
        if (result.error) {
          showFeedback(result.error, "error");
          return;
        }

        const content = result.content || "";
        const extensions: Record<string, string> = {
          txt: "txt",
          json: "json",
          srt: "srt",
          markdown: "md",
        };
        const ext = extensions[format] || "txt";
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transcript-${currentVideoId}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        showFeedback(`Exported as ${format.toUpperCase()}`, "success");
      } catch {
        showFeedback("Export failed", "error");
      }
    },
    [segments, currentVideoId]
  );

  const handleCopy = useCallback(async () => {
    try {
      const result = await exportTranscript(segments, "txt");
      if (result.content) {
        await writeText(result.content);
        showFeedback("Copied to clipboard", "success");
      }
    } catch {
      showFeedback("Copy failed", "error");
    }
  }, [segments]);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setSegments(entry.segments);
    setCurrentVideoId(entry.videoId);
    setCurrentUrl(entry.url);
    setCurrentTitle(entry.title);
    setSelectedLanguage(entry.language);
  }, []);

  const handleHistoryRemove = useCallback((videoId: string) => {
    removeFromHistory(videoId);
    setHistory(getHistory());
  }, []);

  const handleHistoryClear = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  return (
    <div className="app">
      <Feedback message={feedback.message} type={feedback.type} />
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
      {update && (
        <UpdateBanner
          latestVersion={update.version}
          downloadUrl={update.url}
          onDismiss={() => setUpdate(null)}
        />
      )}
      <InputPanel
        onFetch={handleFetch}
        loading={loading}
        tracks={tracks}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
      />
      <div className="main-content">
        <div className="content-area">
          {segments.length > 0 ? (
            <>
              {currentTitle && (
                <div className="video-title-bar">
                  <svg className="yt-icon" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="28" height="20" rx="4" fill="#FF0000"/>
                    <path d="M11.5 6.5V14L18.5 10L11.5 6.5Z" fill="white"/>
                  </svg>
                  <div className="video-title-text">
                    <h2>{currentTitle}</h2>
                  </div>
                </div>
              )}
              <ExportBar
                onExport={handleExport}
                onCopy={handleCopy}
                disabled={segments.length === 0}
              />
              <TranscriptView
                segments={segments}
                showTimestamps={showTimestamps}
                onToggleTimestamps={() => setShowTimestamps(!showTimestamps)}
              />
            </>
          ) : (
            !loading && (
              <div className="empty-state-main">
                <p>Paste a YouTube URL above to get started</p>
              </div>
            )
          )}
          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p className="loading-step">{loadingStep}</p>
              <p className="loading-hint">This may take a few seconds</p>
            </div>
          )}
        </div>
        <HistoryPanel
          history={history}
          onSelect={handleHistorySelect}
          onRemove={handleHistoryRemove}
          onClear={handleHistoryClear}
        />
      </div>
    </div>
  );
}
