<script lang="ts">
  import '../styles/global.css';
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { memory } from '$lib/stores/memory';

  let { children } = $props();

  onMount(async () => {
    await settings.load();
    await memory.load();
  });
</script>

{@render children()}
