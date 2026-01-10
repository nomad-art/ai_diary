<script lang="ts">
  import { open, save } from '@tauri-apps/plugin-dialog';
  import { invoke } from '@tauri-apps/api/core';
  import { settings, t, type AppSettings } from '$lib/stores/settings';

  interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: () => void;
  }

  let { isOpen, onClose, onImport }: SettingsProps = $props();

  // Local state for editing
  let localSettings = $state<AppSettings>({
    aiName: 'AI',
    language: 'en',
    exportFormat: 'json',
    exportLanguage: 'en',
    dataPath: ''
  });
  
  let isSaving = $state(false);

  // Sync local state when modal opens
  $effect(() => {
    if (isOpen) {
      const unsub = settings.subscribe(s => {
        localSettings = { ...s };
      });
      return unsub;
    }
  });

  async function selectDirectory() {
    const selected = await open({
      directory: true,
      multiple: false,
      title: $t('settings.dataDirectory')
    });

    if (selected && typeof selected === 'string') {
      localSettings.dataPath = selected;
    }
  }

  async function saveSettings() {
    isSaving = true;
    try {
      const success = await settings.save(localSettings);
      if (success) {
        onClose();
      } else {
        alert('Failed to save settings');
      }
    } finally {
      isSaving = false;
    }
  }

  async function handleExport() {
    const path = await save({
      defaultPath: `diary_export_${new Date().toISOString().split('T')[0]}.${localSettings.exportFormat}`,
      filters: [{ name: localSettings.exportFormat.toUpperCase(), extensions: [localSettings.exportFormat] }]
    });
    
    if (path) {
      try {
        await invoke('export_diary', { 
          path, 
          format: localSettings.exportFormat,
          language: localSettings.exportLanguage 
        });
      } catch (e) {
        console.error('Export failed:', e);
      }
    }
  }

  async function handleBackup() {
    const path = await save({
      defaultPath: `diary_backup_${new Date().toISOString().split('T')[0]}.zip`,
      filters: [{ name: 'ZIP Archive', extensions: ['zip'] }]
    });
    
    if (path) {
      try {
        await invoke('create_backup', { path });
      } catch (e) {
        console.error('Backup failed:', e);
      }
    }
  }

  function handleImport() {
    onClose();
    onImport();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
  <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal">
      <h2>{$t('settings.title')}</h2>
      <p class="subtitle">{$t('settings.subtitle')}</p>

      <div class="settings-container">
        <!-- AI Name -->
        <div class="setting-row">
          <div class="label-section">
            <span class="label">{$t('settings.aiName')}</span>
            <span class="hint">{$t('settings.aiNameHint')}</span>
          </div>
          <div class="input-wrapper text-input">
            <input
              type="text"
              bind:value={localSettings.aiName}
              placeholder="AI"
            />
          </div>
        </div>

        <!-- Interface Language -->
        <div class="setting-row">
          <div class="label-section">
            <span class="label">{$t('settings.language')}</span>
          </div>
          <div class="select-wrapper">
            <select bind:value={localSettings.language}>
              <option value="en">{$t('lang.en')}</option>
              <option value="ru">{$t('lang.ru')}</option>
            </select>
            <svg class="chevron" width="14" height="9" viewBox="0 0 14 9" fill="none">
              <path d="M1 1L7 7L13 1" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- Export Format -->
        <div class="setting-row">
          <div class="label-section">
            <span class="label">{$t('settings.exportFormat')}</span>
          </div>
          <div class="select-wrapper">
            <select bind:value={localSettings.exportFormat}>
              <option value="json">{$t('format.json')}</option>
              <option value="md">{$t('format.md')}</option>
              <option value="txt">{$t('format.txt')}</option>
              <option value="zip">{$t('format.zip')}</option>
            </select>
            <svg class="chevron" width="14" height="9" viewBox="0 0 14 9" fill="none">
              <path d="M1 1L7 7L13 1" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- Export Language -->
        <div class="setting-row">
          <div class="label-section">
            <span class="label">{$t('settings.exportLanguage')}</span>
          </div>
          <div class="select-wrapper">
            <select bind:value={localSettings.exportLanguage}>
              <option value="en">{$t('lang.en')}</option>
              <option value="ru">{$t('lang.ru')}</option>
            </select>
            <svg class="chevron" width="14" height="9" viewBox="0 0 14 9" fill="none">
              <path d="M1 1L7 7L13 1" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- Data Directory -->
        <div class="setting-row">
          <div class="label-section">
            <span class="label">{$t('settings.dataDirectory')}</span>
          </div>
          <div class="directory-wrapper">
            <div class="directory-display">
              <span class="path-text">{localSettings.dataPath || '...'}</span>
            </div>
            <button class="folder-btn" onclick={selectDirectory} aria-label="Select folder">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18 17.5H2V5H18M18 2.5H10L8 0H2C0.89 0 0 1.1125 0 2.5V17.5C0 18.163 0.211 18.7989 0.586 19.2678C0.961 19.7366 1.47 20 2 20H18C18.53 20 19.039 19.7366 19.414 19.2678C19.789 18.7989 20 18.163 20 17.5V5C20 4.337 19.789 3.7011 19.414 3.2322C19.039 2.7634 18.53 2.5 18 2.5Z" fill="#FFF9E8"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="buttons-row">
        <!-- Export button -->
        <button class="action-btn" onclick={handleExport} aria-label={$t('action.export')}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V4M12 16L8 12M12 16L16 12" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 14V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Backup button -->
        <button class="action-btn" onclick={handleBackup} aria-label={$t('settings.backup')}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H14L21 10V19C21 20.1046 20.1046 21 19 21Z" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 21V13H7V21" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 3V8H15" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Import button -->
        <button class="action-btn" onclick={handleImport} aria-label={$t('action.import')}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V16M12 4L8 8M12 4L16 8" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 14V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Save button -->
        <button class="save-btn" onclick={saveSettings} disabled={isSaving} aria-label={$t('action.save')}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M3.077 6.923a3.85 3.85 0 0 1 1.126-2.72 3.85 3.85 0 0 1 2.72-1.126h2.308V10a3.859 3.859 0 0 0 1.126 2.72 3.85 3.85 0 0 0 2.72 1.126h12.308a3.837 3.837 0 0 0 3.553-2.374c.193-.467.293-.967.293-1.472V3.138a3.85 3.85 0 0 1 2.027 1.065l4.539 4.539a3.86 3.86 0 0 1 1.126 2.72v21.615a3.845 3.845 0 0 1-3.077 3.769v-13A3.845 3.845 0 0 0 30 20H10a3.846 3.846 0 0 0-3.846 3.846v13a3.845 3.845 0 0 1-3.077-3.769zM9.231 36.923V23.846a.77.77 0 0 1 .769-.769h20a.77.77 0 0 1 .769.769v13.077zM26.154 3.077V10a.77.77 0 0 1-.769.769H13.077a.77.77 0 0 1-.769-.769V3.077zM6.923 0a6.92 6.92 0 0 0-4.895 2.028A6.92 6.92 0 0 0 0 6.923v26.154a6.92 6.92 0 0 0 2.028 4.895A6.92 6.92 0 0 0 6.923 40h26.154a6.92 6.92 0 0 0 4.895-2.028A6.92 6.92 0 0 0 40 33.077V11.462a6.92 6.92 0 0 0-2.028-4.896l-4.538-4.538A6.92 6.92 0 0 0 28.538 0z" fill="#FFF9E8"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    width: 800px;
    background: var(--color-background);
    border-radius: 40px;
    padding: 30px 30px 40px;
    box-shadow: 
      -5px -2px 10px rgba(0, 225, 255, 0.2),
      5px 10px 10px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h2 {
    font-family: var(--font-heading);
    font-size: 48px;
    font-weight: var(--font-weight-light);
    color: var(--color-h1);
    margin: 0 0 8px 0;
    align-self: flex-start;
  }

  .subtitle {
    font-size: 14px;
    color: var(--color-h2);
    margin: 0 0 20px 0;
    align-self: flex-start;
  }

  .settings-container {
    width: 740px;
    background: var(--color-background);
    border-radius: 20px;
    padding: 15px 20px;
    margin-bottom: 30px;
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .setting-row {
    width: 700px;
    height: 60px;
    background: var(--color-background);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 0 10px;
  }

  .label-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .label {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: var(--font-weight-medium);
    color: var(--color-body);
  }

  .hint {
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: var(--font-weight-regular);
    color: var(--color-h2);
  }

  .input-wrapper {
    height: 40px;
    background: var(--color-background);
    border-radius: 20px;
    display: flex;
    align-items: center;
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }

  .text-input {
    width: 150px;
    padding: 0 20px;
  }

  .text-input input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--color-body);
  }

  .text-input input::placeholder {
    color: var(--color-h2);
  }

  .select-wrapper {
    position: relative;
    width: 300px;
    height: 40px;
  }

  .select-wrapper select {
    width: 100%;
    height: 100%;
    padding: 0 50px 0 20px;
    background: var(--color-background);
    border: none;
    border-radius: 20px;
    outline: none;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--color-body);
    cursor: pointer;
    appearance: none;
    box-shadow: 
      -5px -2px 10px rgba(0, 225, 255, 0.2),
      5px 10px 10px rgba(0, 0, 0, 0.25);
  }

  .select-wrapper .chevron {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .directory-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .directory-display {
    width: 307px;
    height: 40px;
    background: var(--color-background);
    border-radius: 20px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }

  .path-text {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--color-h2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .folder-btn {
    width: 40px;
    height: 40px;
    background: var(--color-background);
    border: none;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      -5px -2px 10px rgba(0, 225, 255, 0.2),
      5px 10px 10px rgba(0, 0, 0, 0.25);
    transition: all var(--transition-normal);
  }

  .folder-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      -6px -3px 12px rgba(0, 225, 255, 0.25),
      6px 12px 12px rgba(0, 0, 0, 0.3);
  }

  .folder-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }

  .folder-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .buttons-row {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .action-btn {
    width: 60px;
    height: 60px;
    background: var(--color-background);
    border: none;
    border-radius: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      -5px -2px 10px rgba(0, 225, 255, 0.2),
      5px 10px 10px rgba(0, 0, 0, 0.25);
    transition: all var(--transition-normal);
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 
      -6px -3px 12px rgba(0, 225, 255, 0.25),
      6px 12px 12px rgba(0, 0, 0, 0.3);
  }

  .action-btn:active {
    transform: translateY(0);
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }

  .save-btn {
    width: 72px;
    height: 72px;
    background: var(--color-background);
    border: none;
    border-radius: 36px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      -5px -2px 10px rgba(0, 225, 255, 0.2),
      5px 10px 10px rgba(0, 0, 0, 0.25);
    transition: all var(--transition-normal);
  }

  .save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      -6px -3px 12px rgba(0, 225, 255, 0.25),
      6px 12px 12px rgba(0, 0, 0, 0.3);
  }

  .save-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
