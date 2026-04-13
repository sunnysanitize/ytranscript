use serde::{Deserialize, Serialize};
use tauri::command;
use url::Url;
use yt_transcript_rs::YouTubeTranscriptApi;

#[derive(Debug, Serialize)]
struct TranscriptTrack {
    language: String,
    language_code: String,
    is_generated: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct TranscriptSegment {
    text: String,
    start: f64,
    duration: f64,
}

fn is_video_id(value: &str) -> bool {
    value.len() == 11
        && value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || ch == '-' || ch == '_')
}

fn extract_video_id_from_url(input: &str) -> Option<String> {
    let trimmed = input.trim();
    if is_video_id(trimmed) {
        return Some(trimmed.to_string());
    }

    let url = Url::parse(trimmed).ok()?;
    let host = url.domain()?.to_ascii_lowercase();

    let candidate = if host == "youtu.be" {
        url.path_segments()?.next().map(str::to_string)
    } else if host.ends_with("youtube.com") || host.ends_with("youtube-nocookie.com") {
        match url.path() {
            "/watch" => url
                .query_pairs()
                .find(|(key, _)| key == "v")
                .map(|(_, value)| value.into_owned()),
            path => {
                let mut segments = path.trim_start_matches('/').split('/');
                match segments.next() {
                    Some("embed") | Some("v") | Some("shorts") | Some("live") => {
                        segments.next().map(str::to_string)
                    }
                    _ => None,
                }
            }
        }
    } else {
        None
    }?;

    is_video_id(&candidate).then_some(candidate)
}

fn format_timestamp(seconds: f64) -> String {
    let safe_seconds = seconds.max(0.0);
    let hours = (safe_seconds / 3600.0).floor() as u64;
    let minutes = ((safe_seconds % 3600.0) / 60.0).floor() as u64;
    let secs = (safe_seconds % 60.0).floor() as u64;
    let millis = ((safe_seconds.fract()) * 1000.0).floor() as u64;
    format!("{hours:02}:{minutes:02}:{secs:02},{millis:03}")
}

fn format_timestamp_short(seconds: f64) -> String {
    let safe_seconds = seconds.max(0.0);
    let minutes = (safe_seconds / 60.0).floor() as u64;
    let secs = (safe_seconds % 60.0).floor() as u64;
    format!("{minutes}:{secs:02}")
}

fn export_as_txt(segments: &[TranscriptSegment]) -> String {
    segments
        .iter()
        .map(|segment| format!("[{}] {}", format_timestamp_short(segment.start), segment.text))
        .collect::<Vec<_>>()
        .join("\n")
}

fn export_as_json(segments: &[TranscriptSegment]) -> Result<String, String> {
    serde_json::to_string_pretty(segments).map_err(|err| format!("Export error: {err}"))
}

fn export_as_srt(segments: &[TranscriptSegment]) -> String {
    let mut output = Vec::with_capacity(segments.len() * 4);
    for (index, segment) in segments.iter().enumerate() {
        output.push((index + 1).to_string());
        output.push(format!(
            "{} --> {}",
            format_timestamp(segment.start),
            format_timestamp(segment.start + segment.duration)
        ));
        output.push(segment.text.clone());
        output.push(String::new());
    }
    output.join("\n")
}

fn export_as_markdown(segments: &[TranscriptSegment]) -> String {
    let mut lines = vec!["# Transcript".to_string(), String::new()];
    for segment in segments {
        lines.push(format!(
            "**[{}]** {}  ",
            format_timestamp_short(segment.start),
            segment.text
        ));
    }
    lines.join("\n")
}

fn create_api() -> Result<YouTubeTranscriptApi, String> {
    YouTubeTranscriptApi::new(None, None, None)
        .map_err(|err| format!("Failed to initialize transcript client: {err}"))
}

fn map_api_error(err: impl std::fmt::Display) -> String {
    let raw = err.to_string();
    let lower = raw.to_ascii_lowercase();

    if lower.contains("transcripts disabled") || lower.contains("transcriptsdisabled") {
        "This video does not have a public transcript available.".to_string()
    } else if lower.contains("no transcript")
        || lower.contains("notranscriptfound")
        || lower.contains("transcript not available")
    {
        "No transcript found for the selected language.".to_string()
    } else if lower.contains("video unavailable")
        || lower.contains("videounavailable")
        || lower.contains("invalid video id")
        || lower.contains("invalidvideoid")
    {
        "This video is unavailable or does not exist.".to_string()
    } else if lower.contains("age restricted") {
        "This video is age-restricted and its transcript is not publicly available.".to_string()
    } else if lower.contains("request blocked")
        || lower.contains("failed to fetch")
        || lower.contains("http")
        || lower.contains("network")
    {
        format!("We could not reach YouTube right now. Please try again in a moment. ({raw})")
    } else {
        format!("Transcript fetch failed: {raw}")
    }
}

#[command]
fn extract_video_id(url: String) -> Result<String, String> {
    let payload = if let Some(video_id) = extract_video_id_from_url(&url) {
        serde_json::json!({ "video_id": video_id })
    } else {
        serde_json::json!({ "error": "That link does not look like a valid YouTube video URL." })
    };

    Ok(payload.to_string())
}

#[command]
async fn list_transcripts(video_id: String) -> Result<String, String> {
    let api = create_api()?;
    let transcript_list = api
        .list_transcripts(&video_id)
        .await
        .map_err(map_api_error)?;

    let transcripts = transcript_list
        .transcripts()
        .map(|transcript| TranscriptTrack {
            language: transcript.language().to_string(),
            language_code: transcript.language_code().to_string(),
            is_generated: transcript.is_generated(),
        })
        .collect::<Vec<_>>();

    Ok(serde_json::json!({ "transcripts": transcripts }).to_string())
}

#[command]
async fn fetch_transcript(video_id: String, language: String) -> Result<String, String> {
    let api = create_api()?;
    let transcript = api
        .fetch_transcript(&video_id, &[language.as_str()], false)
        .await
        .map_err(map_api_error)?;

    let segments = transcript
        .snippets
        .iter()
        .map(|snippet| TranscriptSegment {
            text: snippet.text.clone(),
            start: snippet.start,
            duration: snippet.duration,
        })
        .collect::<Vec<_>>();

    Ok(serde_json::json!({ "segments": segments }).to_string())
}

#[command]
async fn fetch_title(video_id: String) -> Result<String, String> {
    let api = create_api()?;
    let title = api
        .fetch_video_details(&video_id)
        .await
        .map(|details| details.title)
        .unwrap_or(video_id);

    Ok(serde_json::json!({ "title": title }).to_string())
}

#[command]
fn export_transcript(segments_json: String, format: String) -> Result<String, String> {
    let segments =
        serde_json::from_str::<Vec<TranscriptSegment>>(&segments_json).unwrap_or_default();

    let content = match format.as_str() {
        "txt" => Ok(export_as_txt(&segments)),
        "json" => export_as_json(&segments),
        "srt" => Ok(export_as_srt(&segments)),
        "markdown" => Ok(export_as_markdown(&segments)),
        _ => Err(format!("Unknown format: {format}")),
    }?;

    Ok(serde_json::json!({ "content": content }).to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            extract_video_id,
            list_transcripts,
            fetch_transcript,
            fetch_title,
            export_transcript,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
