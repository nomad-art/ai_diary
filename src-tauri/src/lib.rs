use std::fs;
use std::path::PathBuf;
use serde_json::Value;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_default_data_path() -> Result<String, String> {
    let home = dirs::document_dir()
        .ok_or("Could not find Documents directory")?;
    let path = home.join("AI Diary");
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn ensure_data_structure(base_path: String) -> Result<(), String> {
    let base = PathBuf::from(base_path);

    let dirs = vec![
        base.join("entries/open"),
        base.join("entries/inner"),
        base.join("entries/sealed"),
        base.join("gallery"),
        base.join("memory"),
    ];

    for dir in dirs {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    // Create default config if it doesn't exist
    let config_path = base.join("config.json");
    if !config_path.exists() {
        let default_config = serde_json::json!({
            "aiName": "Claude",
            "language": "en",
            "exportFormat": "json",
            "exportLanguage": "en",
            "dataPath": base.to_string_lossy()
        });
        fs::write(&config_path, serde_json::to_string_pretty(&default_config).unwrap())
            .map_err(|e| format!("Failed to create config: {}", e))?;
    }

    // Create default memory if it doesn't exist
    let memory_path = base.join("memory/memory.json");
    if !memory_path.exists() {
        fs::write(&memory_path, "[]")
            .map_err(|e| format!("Failed to create memory file: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn read_json_file(path: String) -> Result<Value, String> {
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    let json: Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    Ok(json)
}

#[tauri::command]
fn write_json_file(path: String, content: Value) -> Result<(), String> {
    let json_string = serde_json::to_string_pretty(&content)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
    fs::write(&path, json_string)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_default_data_path,
            ensure_data_structure,
            read_json_file,
            write_json_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
