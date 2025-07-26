<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, signOutUser } from '$lib/stores/auth';

  let loading = true;

  onMount(() => {
    // Subscribe to auth state
    const unsubscribe = authStore.subscribe(async (auth) => {
      loading = auth.loading;
      
      // If not loading and no user, redirect to login
      if (!auth.loading && !auth.user && $page.url.pathname !== '/admin/login') {
        await goto('/admin/login');
      }
    });

    return unsubscribe;
  });

  async function handleSignOut() {
    await signOutUser();
    await goto('/admin/login');
  }
</script>

{#if loading}
  <!-- Loading Screen -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading...</p>
    </div>
  </div>
{:else if $authStore.user || $page.url.pathname === '/admin/login'}
  <!-- Admin Interface -->
  <div class="min-h-screen bg-gray-50">
    
    {#if $authStore.user && $page.url.pathname !== '/admin/login'}
      <!-- Admin Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo and Title -->
            <div class="flex items-center">
              <a href="/admin/dashboard" class="flex items-center space-x-3">
                <span class="text-2xl">🦷</span>
                <div>
                  <h1 class="text-xl font-bold text-gray-900">Aurora Dentica</h1>
                  <p class="text-xs text-gray-500">Admin Panel</p>
                </div>
              </a>
            </div>

            <!-- Navigation -->
            <nav class="hidden md:flex space-x-1">
              <a 
                href="/admin/dashboard" 
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/dashboard' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
              >
                Dashboard
              </a>
              <a 
                href="/admin/appointments" 
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/appointments' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
              >
                Appointments
              </a>
              <a 
                href="/admin/inventory" 
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/inventory' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
              >
                Inventory
              </a>
              <a 
                href="/admin/promos" 
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/promos' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
              >
                Promotions
              </a>
            </nav>

            <!-- User Menu -->
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                Welcome, {$authStore.user?.email?.split('@')[0]}
              </span>
              <button 
                on:click={handleSignOut}
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="md:hidden border-t border-gray-200 bg-gray-50">
          <div class="px-4 py-2 space-y-1">
            <a 
              href="/admin/dashboard" 
              class="block px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/dashboard' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white'}"
            >
              📊 Dashboard
            </a>
            <a 
              href="/admin/appointments" 
              class="block px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/appointments' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white'}"
            >
              📅 Appointments
            </a>
            <a 
              href="/admin/inventory" 
              class="block px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/inventory' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white'}"
            >
              📦 Inventory
            </a>
            <a 
              href="/admin/promos" 
              class="block px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/admin/promos' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white'}"
            >
              🎉 Promotions
            </a>
          </div>
        </div>
      </header>
    {/if}

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

  </div>
{:else}
  <!-- Fallback for unauthorized access -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="text-red-500 text-6xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p class="text-gray-600 mb-6">You need to be logged in to access the admin panel.</p>
      <a 
        href="/admin/login" 
        class="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        Go to Login
      </a>
    </div>
  </div>
{/if}