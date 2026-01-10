<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Card from '$lib/components/Card.svelte';
  import Settings from '$lib/components/modals/Settings.svelte';
  import Memory from '$lib/components/modals/Memory.svelte';
  import Import from '$lib/components/modals/Import.svelte';
  import { t } from '$lib/stores/settings';

  let sidebarOpen = $state(false);
  let memoryModalOpen = $state(false);
  let settingsModalOpen = $state(false);
  let importModalOpen = $state(false);

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function openMemoryModal() {
    memoryModalOpen = true;
  }

  function openImportModal() {
    importModalOpen = true;
  }

  function openSettingsModal() {
    settingsModalOpen = true;
  }

  function closeModals() {
    memoryModalOpen = false;
    settingsModalOpen = false;
    importModalOpen = false;
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      closeModals();
    }
  }

  function goToNotes() {
    console.log('Navigate to Notes');
  }

  function goToGallery() {
    console.log('Navigate to Gallery');
  }

  function goToResearches() {
    console.log('Navigate to Researches');
  }
</script>

<div class="app">
  <!-- Background blur orbs -->
  <div class="blur blur-green"></div>
  <div class="blur blur-purple"></div>
  <div class="blur blur-orange"></div>

  <Header
    onMemoryClick={openMemoryModal}
    onSettingsClick={openSettingsModal}
  />

  <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

  <main class:sidebar-open={sidebarOpen}>
    <div class="cards-grid">
      <Card
        title={$t('card.notes.title')}
        description={$t('card.notes.desc')}
        image="/images/notebook.png"
        variant="notes"
        onClick={goToNotes}
      />
      <Card
        title={$t('card.gallery.title')}
        description={$t('card.gallery.desc')}
        image="/images/palette.png"
        variant="gallery"
        onClick={goToGallery}
      />
      <Card
        title={$t('card.researches.title')}
        description={$t('card.researches.desc')}
        image="/images/microscope.png"
        variant="researches"
        onClick={goToResearches}
      />
    </div>
  </main>

  <!-- Modals will be added here -->
  <Memory isOpen={memoryModalOpen} onClose={() => memoryModalOpen = false} />

  <Settings isOpen={settingsModalOpen} onClose={() => settingsModalOpen = false} onImport={openImportModal} />

  <Import isOpen={importModalOpen} onClose={() => importModalOpen = false} />
</div>

<style>
  .app {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  /* Background blur orbs */
  .blur {
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.3;
    pointer-events: none;
    z-index: 0;
  }

  .blur-green {
    background: #00ff88;
    top: 10%;
    left: 5%;
  }

  .blur-purple {
    background: #c800ff;
    top: 20%;
    right: 10%;
  }

  .blur-orange {
    background: var(--color-accent-1);
    bottom: 15%;
    left: 40%;
  }

  main {
    margin-left: 0;
    margin-right: 0;
    margin-top: var(--spacing-md);
    padding: var(--spacing-2xl);
    min-height: calc(100vh - 60px - var(--spacing-md) * 4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal);
    position: relative;
    z-index: 1;
  }

  main.sidebar-open {
    margin-left: calc(321px + var(--spacing-md) * 2);
  }

  .cards-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 85px;
    justify-content: center;
    align-items: center;
    transition: gap 0.4s ease;
  }

  main.sidebar-open .cards-grid {
    gap: 44px;
  }

  /* Modal styles */
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
  }

  .modal {
    background: var(--color-background);
    border-radius: var(--radius-lg);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-neomorph-static);
    border: 1px solid rgba(0, 225, 255, 0.2);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal h1 {
    margin-bottom: var(--spacing-lg);
  }

  .modal button {
    margin-top: var(--spacing-lg);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--color-background);
    box-shadow: var(--shadow-button-default);
    border-radius: var(--radius-sm);
    color: var(--color-body);
  }

  .modal button:hover {
    box-shadow: var(--shadow-button-hover);
  }


</style>
