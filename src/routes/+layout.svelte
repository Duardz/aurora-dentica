<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { initAuth } from '$lib/stores/auth';

  onMount(() => {
    // Initialize Firebase auth state listener
    initAuth();
  });
</script>

<main class="min-h-screen bg-white">
  <slot />
</main>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>