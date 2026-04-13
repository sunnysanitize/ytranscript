use std::path::PathBuf;
use std::process::Command;
use tauri::command;

fn find_project_root() -> Option<PathBuf> {
    // Method 1: YTRANSCRIPTS_ROOT env var (for packaged builds)
    if let Ok(root) = std::env::var("YTRANSCRIPTS_ROOT") {
        let p = PathBuf::from(&root);
        if p.join("backend").exists() {
            return Some(p);
        }
    }

    // Method 2: Walk up from the executable (works in dev)
    if let Ok(exe) = std::env::current_exe() {
        let mut dir = exe.parent().map(|p| p.to_path_buf());
        for _ in 0..10 {
            if let Some(ref d) = dir {
                if d.join("backend").join("transcript_service.py").exists() {
                    return Some(d.clone());
                }
                dir = d.parent().map(|p| p.to_path_buf());
            } else {
                break;
            }
        }
    }

    // Method 3: Walk up from CWD
    if let Ok(cwd) = std::env::current_dir() {
        let mut dir = Some(cwd);
        for _ in 0..5 {
            if let Some(ref d) = dir {
                if d.join("backend").join("transcript_service.py").exists() {
                    return Some(d.clone());
                }
                dir = d.parent().map(|p| p.to_path_buf());
            } else {
                break;
            }
        }
    }

    None
}

fn python_cmd() -> String {
    if let Some(root) = find_project_root() {
        let venv_python = root.join("backend/venv/bin/python3");
        if venv_python.exists() {
            return venv_python.to_string_lossy().to_string();
        }
    }
    "python3".to_string()
}

fn backend_script() -> String {
    if let Some(root) = find_project_root() {
        return root
            .join("backend/transcript_service.py")
            .to_string_lossy()
            .to_string();
    }
    "backend/transcript_service.py".to_string()
}

fn run_backend(cmd: &str, args_json: &str) -> Result<String, String> {
    let python = python_cmd();
    let script = backend_script();

    let output = Command::new(&python)
        .arg(&script)
        .arg(cmd)
        .arg(args_json)
        .output()
        .map_err(|e| format!("Failed to run Python backend: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Backend error: {}", stderr));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

#[command]
fn extract_video_id(url: String) -> Result<String, String> {
    run_backend(
        "extract_id",
        &serde_json::json!({"url": url}).to_string(),
    )
}

#[command]
fn list_transcripts(video_id: String) -> Result<String, String> {
    run_backend(
        "list_transcripts",
        &serde_json::json!({"video_id": video_id}).to_string(),
    )
}

#[command]
fn fetch_transcript(video_id: String, language: String) -> Result<String, String> {
    run_backend(
        "fetch_transcript",
        &serde_json::json!({"video_id": video_id, "language": language}).to_string(),
    )
}

#[command]
fn export_transcript(segments_json: String, format: String) -> Result<String, String> {
    let args = serde_json::json!({
        "segments": serde_json::from_str::<serde_json::Value>(&segments_json).unwrap_or_default(),
        "format": format
    });
    run_backend("export", &args.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
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
            export_transcript,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
