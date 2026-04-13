export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptTrack {
  language: string;
  language_code: string;
  is_generated: boolean;
}

export interface HistoryEntry {
  videoId: string;
  url: string;
  title: string;
  language: string;
  fetchedAt: string;
  segments: TranscriptSegment[];
}
