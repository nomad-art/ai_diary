<script lang="ts">
  import { t } from '$lib/stores/settings';
  import { open } from '@tauri-apps/plugin-dialog';
  import { invoke } from '@tauri-apps/api/core';

  interface ImportProps {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: ImportProps = $props();

  let selectedFile = $state<string | null>(null);
  let importType = $state<'json' | 'md' | 'zip'>('json');
  let isImporting = $state(false);
  let previewData = $state<any>(null);
  let importError = $state<string | null>(null);

  async function selectFile() {
    const extensions = importType === 'zip' ? ['zip'] : importType === 'md' ? ['md'] : ['json'];
    const path = await open({
      filters: [{ name: importType.toUpperCase(), extensions }],
      multiple: false
    });
    
    if (path && typeof path === 'string') {
      selectedFile = path;
      importError = null;
      await loadPreview();
    }
  }

  async function loadPreview() {
    if (!selectedFile) return;
    
    try {
      previewData = await invoke('preview_import', { 
        path: selectedFile, 
        format: importType 
      });
    } catch (e) {
      console.error('Preview failed:', e);
      previewData = null;
    }
  }

  async function handleImport() {
    if (!selectedFile) return;
    
    isImporting = true;
    importError = null;
    
    try {
      await invoke('import_diary', { 
        path: selectedFile, 
        format: importType 
      });
      onClose();
    } catch (e) {
      console.error('Import failed:', e);
      importError = String(e);
    } finally {
      isImporting = false;
    }
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

  function resetState() {
    selectedFile = null;
    previewData = null;
    importError = null;
  }

  $effect(() => {
    if (!isOpen) {
      resetState();
    }
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
  <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal">
      <h2>{$t('import.title')}</h2>
      <p class="subtitle">{$t('import.subtitle')}</p>

      <div class="import-container">
        <!-- Import Type Selection -->
        <div class="setting-row">
          <div class="label-section">
            <span class="label">{$t('import.format')}</span>
          </div>
          <div class="select-wrapper">
            <select bind:value={importType} onchange={() => { selectedFile = null; previewData = null; }}>
              <option value="json">{$t('format.json')}</option>
              <option value="md">{$t('format.md')}</option>
              <option value="zip">{$t('format.zip')}</option>
            </select>
            <svg class="chevron" width="14" height="9" viewBox="0 0 14 9" fill="none">
              <path d="M1 1L7 7L13 1" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- File Selection -->
        <div class="setting-row">
          <div class="label-section">
            <span class="label">{$t('import.file')}</span>
          </div>
          <div class="directory-wrapper">
            <div class="directory-display">
              <span class="path-text">{selectedFile || $t('import.selectFile')}</span>
            </div>
            <button class="folder-btn" onclick={selectFile} aria-label={$t('import.browse')}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18 17.5H2V5H18M18 2.5H10L8 0H2C0.89 0 0 1.1125 0 2.5V17.5C0 18.163 0.211 18.7989 0.586 19.2678C0.961 19.7366 1.47 20 2 20H18C18.53 20 19.039 19.7366 19.414 19.2678C19.789 18.7989 20 18.163 20 17.5V5C20 4.337 19.789 3.7011 19.414 3.2322C19.039 2.7634 18.53 2.5 18 2.5Z" fill="#FFF9E8"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Preview Area -->
        {#if previewData}
          <div class="preview-area">
            <span class="preview-label">{$t('import.preview')}</span>
            <div class="preview-content">
              <p>{$t('import.entriesFound')}: <strong>{previewData.entriesCount || 0}</strong></p>
              {#if previewData.dateRange}
                <p>{$t('import.dateRange')}: {previewData.dateRange}</p>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Error Message -->
        {#if importError}
          <div class="error-message">
            {importError}
          </div>
        {/if}
      </div>

      <div class="buttons-row">
        <button class="cancel-btn" onclick={onClose} aria-label={$t('action.cancel')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <button 
          class="import-btn" 
          onclick={handleImport} 
          disabled={!selectedFile || isImporting}
          aria-label={$t('action.import')}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V16M12 4L8 8M12 4L16 8" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 14V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
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
    width: 700px;
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

  .import-container {
    width: 640px;
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
    width: 100%;
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

  .select-wrapper {
    position: relative;
    width: 200px;
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

  .folder-btn:hover {
    transform: translateY(-2px);
    box-shadow: 
      -6px -3px 12px rgba(0, 225, 255, 0.25),
      6px 12px 12px rgba(0, 0, 0, 0.3);
  }

  .folder-btn:active {
    transform: translateY(0);
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }

  .preview-area {
    padding: 15px;
    border-radius: 10px;
    background: rgba(0, 132, 150, 0.1);
    border: 1px solid rgba(0, 132, 150, 0.3);
  }

  .preview-label {
    font-size: 12px;
    color: var(--color-h2);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .preview-content {
    margin-top: 10px;
  }

  .preview-content p {
    margin: 5px 0;
    font-size: 14px;
    color: var(--color-body);
  }

  .preview-content strong {
    color: var(--color-h1);
  }

  .error-message {
    padding: 15px;
    border-radius: 10px;
    background: rgba(255, 100, 100, 0.1);
    border: 1px solid rgba(255, 100, 100, 0.3);
    color: #ff6b6b;
    font-size: 14px;
  }

  .buttons-row {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .cancel-btn {
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

  .cancel-btn:hover {
    transform: translateY(-2px);
  }

  .cancel-btn:active {
    transform: translateY(0);
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }

  .import-btn {
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

  .import-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      -6px -3px 12px rgba(0, 225, 255, 0.25),
      6px 12px 12px rgba(0, 0, 0, 0.3);
  }

  .import-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }

  .import-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
