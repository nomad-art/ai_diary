<script lang="ts">
  import { t, aiName } from '$lib/stores/settings';

  interface HeaderProps {
    onMemoryClick: () => void;
    onSettingsClick: () => void;
  }

  let { onMemoryClick, onSettingsClick }: HeaderProps = $props();
</script>

<header>
  <div class="header-left">
    <div class="logo">
      <img src="/logo/Property=group.svg" alt={$t('app.title')} class="logo-icon" />
      <span class="logo-text">{$aiName} Diary</span>
    </div>
  </div>

  <div class="header-center">
    <div class="search-box">
      <input type="text" placeholder="Search by..." />
    </div>
  </div>

  <div class="header-right">
    <button class="icon-btn" onclick={onMemoryClick} aria-label={$t('modal.memory')}>
      <img src="/icons/Variant=memory.png" alt={$t('modal.memory')} width="40" height="40" />
    </button>
    <button class="icon-btn" onclick={onSettingsClick} aria-label={$t('settings.title')}>
      <img src="/icons/Variant=settings.png" alt={$t('settings.title')} width="40" height="40" />
    </button>
  </div>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--spacing-lg);
    background: var(--color-background);
    box-shadow: var(--shadow-neomorph-static);
    border-radius: 35px;
    margin: var(--spacing-md);
    height: 70px;
    position: relative;
    z-index: 100;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .logo-icon {
    width: 40px;
    height: 40px;
  }

  .logo-text {
    font-family: var(--font-heading);
    font-size: 24px;
    font-weight: var(--font-weight-light);
    color: var(--color-h1);
  }

  .header-center {
    flex: 1;
    max-width: 300px;
    margin: 0 var(--spacing-xl);
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
    height: 50px;
    padding: 0 var(--spacing-lg);
    background: var(--color-background);
    box-shadow: inset -5px -4px 10px rgba(0, 225, 255, 0.25), inset 4px 3px 10px rgba(0, 0, 0, 0.5);
    border-radius: 25px;
    color: var(--color-body);
    font-size: var(--font-size-body);
  }

  .header-right {
    display: flex;
    gap: var(--spacing-sm);
  }

  .icon-btn {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background);
    border-radius: 36px;
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
</style>
