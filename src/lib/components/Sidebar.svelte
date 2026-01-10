<script lang="ts">
  import { t } from '$lib/stores/settings';

  interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
  }

  let { isOpen, onToggle }: SidebarProps = $props();

  // Entries will be loaded from the application data
  const entries: Array<{
    dateKey: string;
    items: Array<{
      id: number;
      icon: string;
      title: string;
      type: string;
      selected?: boolean;
    }>;
  }> = [];
</script>

<aside class="sidebar" class:open={isOpen}>
  <button class="sidebar-toggle" onclick={onToggle}>
    <span class="toggle-text">{$t('sidebar.recents')}</span>
  </button>
  
  {#if isOpen}
    <div class="sidebar-content">
      {#each entries as group}
        <div class="date-group">
          <div class="date-label">{$t(group.dateKey as any)}</div>
          {#each group.items as item}
            <button class="entry-item" class:selected={item.selected}>
              <span class="entry-icon">{item.icon}</span>
              <span class="entry-text">{item.title}</span>
            </button>
          {/each}
        </div>
      {/each}
      
      {#if entries.length === 0}
        <div class="empty-state">
          <p>{$t('empty.noEntries')}</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Triangle toggle button - always at bottom -->
  <button class="triangle-toggle" onclick={onToggle}>
    {#if isOpen}
      <!-- Arrow up (close) -->
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
        <path d="M6.77806 1.89765C8.77992 -0.632549 12.6185 -0.632554 14.6204 1.89764L20.3102 9.08923C22.9038 12.3673 20.5691 17.1916 16.3891 17.1916H5.00934C0.829351 17.1916 -1.50536 12.3673 1.0882 9.08924L6.77806 1.89765Z" fill="#595959"/>
      </svg>
    {:else}
      <!-- Arrow down (open) -->
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
        <path d="M6.77806 15.2939C8.77992 17.8241 12.6185 17.8241 14.6204 15.2939L20.3102 8.10236C22.9038 4.82429 20.5691 0 16.3891 0H5.00934C0.829351 0 -1.50536 4.82428 1.0882 8.10235L6.77806 15.2939Z" fill="#595959"/>
      </svg>
    {/if}
  </button>
</aside>

<style>
  .sidebar {
    position: fixed;
    left: var(--spacing-md);
    top: var(--spacing-md);
    width: 321px;
    background: var(--color-background);
    border-radius: 40px;
    box-shadow: var(--shadow-neomorph-static);
    overflow: visible;
    transition: height var(--transition-normal);
    z-index: 50;
  }

  .sidebar:not(.open) {
    height: 147px;
  }

  .sidebar.open {
    height: 962px;
  }

  .sidebar-toggle {
    position: absolute;
    top: 92px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .toggle-text {
    font-family: var(--font-body);
    font-size: 16px;
    font-weight: var(--font-weight-medium);
    color: var(--color-h2);
    transition: color var(--transition-fast);
  }

  .sidebar-toggle:hover .toggle-text {
    color: var(--color-body);
  }

  .triangle-toggle {
    position: absolute;
    bottom: -11px;
    left: 50%;
    transform: translateX(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 51;
    transition: bottom var(--transition-normal);
  }

  .triangle-toggle:hover svg path {
    fill: var(--color-body);
  }

  .sidebar-content {
    position: absolute;
    top: 147px;
    left: 10px;
    width: 301px;
    height: calc(962px - 147px - 40px);
    padding: 0 var(--spacing-md);
    overflow-y: auto;
  }

  .date-group {
    margin-bottom: var(--spacing-lg);
  }

  .date-label {
    font-size: 14px;
    color: var(--color-h2);
    margin-bottom: var(--spacing-sm);
    padding-left: var(--spacing-sm);
  }

  .entry-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-body);
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-fast);
    margin-bottom: var(--spacing-xs);
  }

  .entry-item:hover {
    background: rgba(0, 132, 150, 0.1);
  }

  .entry-item.selected {
    background: rgba(0, 132, 150, 0.2);
    box-shadow: inset 0 0 0 1px var(--color-accent-2);
  }

  .entry-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .entry-text {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-h2);
  }
</style>
