<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, signOutUser } from '$lib/stores/auth';

  let loading = true;
  let mobileMenuOpen = false;
  let showUserMenu = false;

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Appointments', href: '/admin/appointments', icon: '📅' },
    { name: 'Inventory', href: '/admin/inventory', icon: '📦' },
    { name: 'Promotions', href: '/admin/promos', icon: '🎉' }
  ];

  onMount(() => {
    // Subscribe to auth state
    const unsubscribe = authStore.subscribe(async (auth) => {
      loading = auth.loading;
      
      // If not loading and no user, redirect to login
      if (!auth.loading && !auth.user && $page.url.pathname !== '/admin/login') {
        await goto('/admin/login');
      }
    });

    // Close mobile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mobile-menu-container')) {
        mobileMenuOpen = false;
      }
      if (!target.closest('.user-menu-container')) {
        showUserMenu = false;
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('click', handleClickOutside);
    };
  });

  async function handleSignOut() {
    await signOutUser();
    await goto('/admin/login');
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    showUserMenu = false;
  }

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
    mobileMenuOpen = false;
  }

  function isCurrentPage(href: string): boolean {
    return $page.url.pathname === href;
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
      <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            
            <!-- Logo and Title -->
            <div class="flex items-center flex-shrink-0">
              <a href="/admin/dashboard" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <span class="text-2xl sm:text-3xl">🦷</span>
                <div class="hidden sm:block">
                  <h1 class="text-lg sm:text-xl font-bold text-gray-900">Aurora Dentica</h1>
                  <p class="text-xs text-gray-500">Admin Panel</p>
                </div>
                <div class="sm:hidden">
                  <h1 class="text-lg font-bold text-gray-900">Admin</h1>
                </div>
              </a>
            </div>

            <!-- Desktop Navigation -->
            <nav class="hidden lg:flex space-x-1">
              {#each navigation as item}
                <a 
                  href={item.href} 
                  class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 {isCurrentPage(item.href) 
                    ? 'bg-primary-100 text-primary-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
                >
                  <span class="mr-2">{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              {/each}
            </nav>

            <!-- Right side - User menu and mobile button -->
            <div class="flex items-center space-x-3">
              
              <!-- Desktop User Menu -->
              <div class="hidden lg:block user-menu-container relative">
                <button 
                  on:click={toggleUserMenu}
                  class="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-200"
                >
                  <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {$authStore.user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <span class="hidden xl:inline">{$authStore.user?.email?.split('@')[0]}</span>
                  <svg class="w-4 h-4 transition-transform {showUserMenu ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <!-- User Dropdown -->
                {#if showUserMenu}
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div class="px-4 py-2 border-b border-gray-100">
                      <p class="text-sm font-medium text-gray-900">{$authStore.user?.email?.split('@')[0]}</p>
                      <p class="text-xs text-gray-500">{$authStore.user?.email}</p>
                    </div>
                    <a href="/" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <span class="mr-2">🌐</span>
                      View Public Site
                    </a>
                    <button 
                      on:click={handleSignOut}
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span class="mr-2">🚪</span>
                      Sign Out
                    </button>
                  </div>
                {/if}
              </div>

              <!-- Mobile menu button -->
              <div class="lg:hidden mobile-menu-container">
                <button
                  on:click={toggleMobileMenu}
                  class="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-2 transition-colors"
                  aria-label="Toggle menu"
                >
                  {#if mobileMenuOpen}
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  {:else}
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  {/if}
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Navigation -->
          {#if mobileMenuOpen}
            <div class="lg:hidden border-t border-gray-200 bg-white">
              <div class="px-2 pt-2 pb-3 space-y-1">
                {#each navigation as item}
                  <a 
                    href={item.href}
                    on:click={() => mobileMenuOpen = false}
                    class="block px-3 py-2 rounded-md text-base font-medium transition-colors {isCurrentPage(item.href) 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
                  >
                    <span class="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                {/each}
                
                <!-- Mobile user section -->
                <div class="pt-4 border-t border-gray-200 mt-4">
                  <div class="px-3 py-2 flex items-center space-x-3">
                    <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {$authStore.user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{$authStore.user?.email?.split('@')[0]}</p>
                      <p class="text-xs text-gray-500 truncate">{$authStore.user?.email}</p>
                    </div>
                  </div>
                  <a 
                    href="/" 
                    class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    on:click={() => mobileMenuOpen = false}
                  >
                    <span class="mr-3">🌐</span>
                    <span>View Public Site</span>
                  </a>
                  <button 
                    on:click={handleSignOut}
                    class="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <span class="mr-3">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </header>

      <!-- Breadcrumb Navigation -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-3">
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2 text-sm">
                <li>
                  <a href="/admin/dashboard" class="text-gray-500 hover:text-gray-700 transition-colors">
                    <span class="mr-1">🏠</span>
                    <span class="hidden sm:inline">Admin</span>
                  </a>
                </li>
                {#if $page.url.pathname !== '/admin/dashboard'}
                  <li class="flex items-center">
                    <svg class="flex-shrink-0 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="ml-2 text-gray-700 font-medium">
                      {navigation.find(item => item.href === $page.url.pathname)?.name || 'Page'}
                    </span>
                  </li>
                {/if}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Content with better spacing -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <slot />
      </div>
    </main>

    <!-- Footer for admin -->
    {#if $authStore.user && $page.url.pathname !== '/admin/login'}
      <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div class="mb-2 sm:mb-0">
              <span>© 2024 Aurora Dentica Admin Panel</span>
            </div>
            <div class="flex items-center space-x-4">
              <a href="/" class="hover:text-gray-700 transition-colors">Public Site</a>
              <span>•</span>
              <span>Version 1.0</span>
            </div>
          </div>
        </div>
      </footer>
    {/if}

  </div>
{:else}
  <!-- Fallback for unauthorized access -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="text-red-500 text-5xl sm:text-6xl mb-4">🔒</div>
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p class="text-gray-600 mb-6 text-sm sm:text-base">You need to be logged in to access the admin panel.</p>
      <a 
        href="/admin/login" 
        class="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-block"
      >
        Go to Login
      </a>
    </div>
  </div>
{/if}