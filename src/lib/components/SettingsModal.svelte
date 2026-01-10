<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { open } from '@tauri-apps/plugin-dialog';

  interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: SettingsModalProps = $props();

  let aiName = $state('Claude');
  let language = $state('en');
  let exportFormat = $state('json');
  let dataPath = $state('');
  let isSaving = $state(false);

  async function loadSettings() {
    try {
      const defaultPath = await invoke('get_default_data_path');
      dataPath = defaultPath as string;

      // Try to load config
      const configPath = `${dataPath}/config.json`;
      try {
        const config = await invoke('read_json_file', { path: configPath });
        if (config && typeof config === 'object') {
          aiName = (config as any).aiName || 'Claude';
          language = (config as any).language || 'en';
          exportFormat = (config as any).exportFormat || 'json';
        }
      } catch (e) {
        console.log('No existing config, using defaults');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function saveSettings() {
    isSaving = true;
    try {
      const config = {
        aiName,
        language,
        exportFormat,
        dataPath
      };

      await invoke('ensure_data_structure', { basePath: dataPath });
      const configPath = `${dataPath}/config.json`;
      await invoke('write_json_file', { path: configPath, content: config });

      alert('Settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      isSaving = false;
    }
  }

  async function selectDataPath() {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Data Directory'
      });
      if (selected) {
        dataPath = selected as string;
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  }

  async function createBackup() {
    try {
      const backupPath = await open({
        directory: true,
        multiple: false,
        title: 'Select Backup Location'
      });
      if (backupPath) {
        alert('Backup feature coming soon!');
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  $effect(() => {
    if (isOpen) {
      loadSettings();
    }
  });
</script>

{#if isOpen}
  <div class="modal-overlay" onclick={(e) => e.target === e.currentTarget && onClose()} role="button" tabindex="0">
    <div class="modal">
      <h1 class="modal-title">Settings</h1>
      <p class="modal-subtitle">Customize your AI Diary experience</p>

      <div class="modal-content">
        <div class="field">
          <label class="field-label">AI name (changes the name in the application interface)</label>
          <input
            type="text"
            class="field-input"
            bind:value={aiName}
            placeholder="Claude"
          />
        </div>

        <div class="field">
          <label class="field-label">Interface Language</label>
          <select class="field-input" bind:value={language}>
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label">Export Format</label>
          <select class="field-input" bind:value={exportFormat}>
            <option value="json">JSON</option>
            <option value="md">Markdown</option>
            <option value="txt">Text</option>
            <option value="zip">ZIP Archive</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label">Data Directory</label>
          <div class="path-field">
            <input
              type="text"
              class="field-input path-input"
              bind:value={dataPath}
              readonly
              placeholder="D:\Author\Projects\AI Diary"
            />
            <button class="icon-btn folder-btn" onclick={selectDataPath}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="backup-section">
          <button class="action-btn backup-btn" onclick={createBackup}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" fill="currentColor"/>
            </svg>
            <span>Create Backup</span>
          </button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="action-btn save-btn" onclick={saveSettings} disabled={isSaving}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" fill="currentColor"/>
          </svg>
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: var(--color-background);
    border-radius: var(--radius-lg);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-neomorph-static);
    border: 1px solid rgba(0, 225, 255, 0.2);
    max-width: 600px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-title {
    font-size: var(--font-size-h1);
    margin-bottom: var(--spacing-sm);
  }

  .modal-subtitle {
    font-size: var(--font-size-body);
    color: var(--color-h2);
    margin-bottom: var(--spacing-xl);
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .field-label {
    font-size: 14px;
    color: var(--color-h2);
  }

  .field-input {
    width: 100%;
    padding: var(--spacing-md);
    background: var(--color-background);
    box-shadow: var(--shadow-neomorph-input);
    border-radius: var(--radius-sm);
    color: var(--color-body);
    font-size: var(--font-size-body);
    border: none;
    outline: none;
    transition: box-shadow var(--transition-fast);
  }

  .field-input:focus {
    box-shadow:
      inset 4px 3px 10px var(--color-shadow-dark),
      inset -5px -4px 10px rgba(0, 225, 255, 0.35);
  }

  .path-field {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
  }

  .path-input {
    flex: 1;
  }

  .icon-btn {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-button-default);
    color: var(--color-body);
    transition: all var(--transition-normal);
  }

  .icon-btn:hover {
    box-shadow: var(--shadow-button-hover);
    transform: translateY(-2px);
  }

  .icon-btn:active {
    box-shadow: var(--shadow-button-pressed);
    transform: translateY(0);
  }

  .backup-section {
    padding-top: var(--spacing-md);
    border-top: 1px solid rgba(255, 249, 232, 0.1);
  }

  .action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-background);
    box-shadow: var(--shadow-button-default);
    border-radius: var(--radius-sm);
    color: var(--color-body);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-normal);
  }

  .action-btn:hover:not(:disabled) {
    box-shadow: var(--shadow-button-hover);
    transform: translateY(-2px);
  }

  .action-btn:active:not(:disabled) {
    box-shadow: var(--shadow-button-pressed);
    transform: translateY(0);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-actions {
    margin-top: var(--spacing-xl);
  }

  .save-btn {
    border: 1px solid rgba(0, 225, 255, 0.3);
  }
</style>
