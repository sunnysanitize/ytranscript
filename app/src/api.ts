import { invoke } from "@tauri-apps/api/core";
import type { TranscriptSegment, TranscriptTrack } from "./types";

async function callBackend<T>(command: string, args: Record<string, unknown>): Promise<T> {
  try {
    const result = await invoke<string>(command, args);
    return JSON.parse(result) as T;
  } catch (err) {
    // Tauri invoke errors come as strings
    const message = typeof err === "string" ? err : (err as Error).message || "Unknown error";
    return { error: message } as T;
  }
}

export function extractVideoId(url: string) {
  return callBackend<{ video_id?: string; error?: string }>("extract_video_id", { url });
}

export function listTranscripts(videoId: string) {
  return callBackend<{ transcripts?: TranscriptTrack[]; error?: string }>("list_transcripts", { videoId });
}

export function fetchTranscript(videoId: string, language: string) {
  return callBackend<{ segments?: TranscriptSegment[]; error?: string }>("fetch_transcript", { videoId, language });
}

export function exportTranscript(segments: TranscriptSegment[], format: string) {
  return callBackend<{ content?: string; error?: string }>("export_transcript", {
    segmentsJson: JSON.stringify(segments),
    format,
  });
}
