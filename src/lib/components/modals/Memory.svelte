<script lang="ts">
  import { t } from '$lib/stores/settings';
  import { memory, type MemoryItem } from '$lib/stores/memory';
  import { open, save } from '@tauri-apps/plugin-dialog';
  import { invoke } from '@tauri-apps/api/core';

  interface MemoryProps {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: MemoryProps = $props();

  let editingId = $state<string | null>(null);
  let editText = $state('');
  let isAdding = $state(false);
  let newItemText = $state('');

  // Get items from store
  let items = $state<MemoryItem[]>([]);
  
  $effect(() => {
    if (isOpen) {
      const unsub = memory.subscribe(m => {
        items = m.items;
      });
      return unsub;
    }
  });

  function startEdit(item: MemoryItem) {
    editingId = item.id;
    editText = item.content;
  }

  function saveEdit() {
    if (editingId && editText.trim()) {
      memory.update(editingId, editText.trim());
    }
    cancelEdit();
  }

  function cancelEdit() {
    editingId = null;
    editText = '';
  }

  function deleteItem(id: string) {
    memory.remove(id);
  }

  function startAdd() {
    isAdding = true;
    newItemText = '';
  }

  function confirmAdd() {
    if (newItemText.trim()) {
      memory.add(newItemText.trim());
    }
    cancelAdd();
  }

  function cancelAdd() {
    isAdding = false;
    newItemText = '';
  }

  async function exportMemory() {
    const path = await save({
      defaultPath: 'memory.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    
    if (path) {
      const data = JSON.stringify(items, null, 2);
      await invoke('write_json_file', { path, content: items });
    }
  }

  async function importMemory() {
    const path = await open({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      multiple: false
    });
    
    if (path && typeof path === 'string') {
      try {
        const imported = await invoke('read_json_file', { path }) as MemoryItem[];
        memory.import(imported);
      } catch (e) {
        console.error('Failed to import memory:', e);
      }
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (editingId) {
        cancelEdit();
      } else if (isAdding) {
        cancelAdd();
      } else {
        onClose();
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      if (editingId) {
        e.preventDefault();
        saveEdit();
      } else if (isAdding) {
        e.preventDefault();
        confirmAdd();
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
  <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal">
      <div class="header">
        <div class="header-text">
          <h2>{$t('memory.title')}</h2>
          <p class="subtitle">{$t('memory.subtitle')}</p>
        </div>
        <div class="header-buttons">
          <button class="circle-btn" onclick={importMemory} aria-label={$t('memory.import')}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 4V16M12 4L8 8M12 4L16 8" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 14V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="circle-btn" onclick={exportMemory} aria-label={$t('memory.export')}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4M12 16L8 12M12 16L16 12" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 14V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="content-area">
        <div class="accent-line"></div>
        <div class="scroll-container">
          {#each items as item (item.id)}
            <div class="memory-item">
              {#if editingId === item.id}
                <textarea
                  class="edit-textarea"
                  bind:value={editText}
                  onblur={saveEdit}
                ></textarea>
              {:else}
                <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
                <div class="item-text" onclick={() => startEdit(item)}>
                  {item.content}
                </div>
              {/if}
              <button class="delete-btn" onclick={() => deleteItem(item.id)} aria-label={$t('action.delete')}>
                <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                  <path d="M1 5H19M8 10V16M12 10V16M3 5L4 19C4 20.1046 4.89543 21 6 21H14C15.1046 21 16 20.1046 16 19L17 5M7 5V2C7 1.44772 7.44772 1 8 1H12C12.5523 1 13 1.44772 13 2V5" stroke="#FFF9E8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          {/each}
          
          {#if isAdding}
            <div class="memory-item adding">
              <textarea
                class="edit-textarea"
                bind:value={newItemText}
                placeholder={$t('memory.placeholder')}
                onblur={confirmAdd}
              ></textarea>
            </div>
          {/if}
        </div>
      </div>

      <button class="add-btn" onclick={startAdd} aria-label={$t('memory.add')}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 1V19M1 10H19" stroke="#FFF9E8" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
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
    width: 860px;
    height: 700px;
    background: var(--color-background);
    border-radius: 40px;
    padding: 30px;
    box-shadow: 
      -5px -2px 10px rgba(0, 225, 255, 0.2),
      5px 10px 10px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .header-text {
    display: flex;
    flex-direction: column;
  }

  h2 {
    font-family: var(--font-heading);
    font-size: 48px;
    font-weight: var(--font-weight-light);
    color: var(--color-h1);
    margin: 0;
  }

  .subtitle {
    font-size: 14px;
    color: var(--color-h2);
    margin: 8px 0 0 0;
  }

  .header-buttons {
    display: flex;
    gap: 15px;
  }

  .circle-btn {
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

  .circle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 
      -6px -3px 12px rgba(0, 225, 255, 0.25),
      6px 12px 12px rgba(0, 0, 0, 0.3);
  }

  .circle-btn:active {
    transform: translateY(0);
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }

  .content-area {
    width: 800px;
    height: 480px;
    background: var(--color-background);
    border-radius: 20px;
    position: relative;
    display: flex;
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
    margin-bottom: 20px;
  }

  .accent-line {
    width: 3px;
    height: calc(100% - 40px);
    background: #008496;
    border-radius: 2px;
    margin: 20px 0 20px 15px;
    flex-shrink: 0;
  }

  .scroll-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .scroll-container::-webkit-scrollbar {
    width: 6px;
  }

  .scroll-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .scroll-container::-webkit-scrollbar-thumb {
    background: var(--color-h2);
    border-radius: 3px;
  }

  .memory-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    padding: 15px 0;
    border-bottom: 1px solid rgba(255, 249, 232, 0.1);
  }

  .memory-item:last-child {
    border-bottom: none;
  }

  .item-text {
    flex: 1;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--color-body);
    line-height: 1.5;
    cursor: pointer;
  }

  .item-text:hover {
    color: var(--color-h1);
  }

  .edit-textarea {
    flex: 1;
    min-height: 60px;
    background: transparent;
    border: 1px solid rgba(0, 132, 150, 0.5);
    border-radius: 5px;
    padding: 10px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--color-body);
    line-height: 1.5;
    resize: vertical;
    outline: none;
  }

  .edit-textarea:focus {
    border-color: #008496;
  }

  .edit-textarea::placeholder {
    color: var(--color-h2);
  }

  .delete-btn {
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity var(--transition-normal);
    flex-shrink: 0;
  }

  .delete-btn:hover {
    opacity: 1;
  }

  .add-btn {
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

  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 
      -6px -3px 12px rgba(0, 225, 255, 0.25),
      6px 12px 12px rgba(0, 0, 0, 0.3);
  }

  .add-btn:active {
    transform: translateY(0);
    box-shadow: 
      inset -5px -4px 10px rgba(0, 225, 255, 0.25),
      inset 4px 3px 10px rgba(0, 0, 0, 0.5);
  }
</style>
