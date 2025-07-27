<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore, signOutUser } from '$lib/stores/auth';

  let loading = true;
  let mobileMenuOpen = false;
  let showUserMenu = false;

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: '📊',
      description: 'Overview & Analytics'
    },
    { 
      name: 'Appointments', 
      href: '/admin/appointments', 
      icon: '📅',
      description: 'Patient Scheduling'
    },
    { 
      name: 'Inventory', 
      href: '/admin/inventory', 
      icon: '📦',
      description: 'Supply Management'
    },
    { 
      name: 'Promotions', 
      href: '/admin/promos', 
      icon: '🎉',
      description: 'Marketing Campaigns'
    }
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

    // Close menus when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mobile-menu-container')) {
        mobileMenuOpen = false;
      }
      if (!target.closest('.user-menu-container')) {
        showUserMenu = false;
      }
    };

    // Close mobile menu on route change
    const handleRouteChange = () => {
      mobileMenuOpen = false;
      showUserMenu = false;
    };

    document.addEventListener('click', handleClickOutside);
    
    // Listen for route changes
    const unsubscribeRoute = page.subscribe(() => {
      handleRouteChange();
    });

    return () => {
      unsubscribe();
      unsubscribeRoute();
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

  function getCurrentPageName(): string {
    const current = navigation.find(item => item.href === $page.url.pathname);
    return current?.name || 'Admin';
  }

  function getUserInitials(): string {
    return $authStore.user?.email?.charAt(0).toUpperCase() || 'A';
  }

  function getUserName(): string {
    return $authStore.user?.email?.split('@')[0] || 'Admin';
  }
</script>

{#if loading}
  <!-- Enhanced Loading Screen -->
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
    <div class="text-center">
      <div class="relative">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-2xl">🦷</span>
        </div>
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Aurora Dentica</h2>
      <p class="text-gray-600">Loading admin panel...</p>
    </div>
  </div>
{:else if $authStore.user || $page.url.pathname === '/admin/login'}
  <!-- Enhanced Admin Interface -->
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
    
    {#if $authStore.user && $page.url.pathname !== '/admin/login'}
      <!-- Enhanced Admin Header -->
      <header class="bg-white/95 backdrop-blur-md shadow-lg border-b border-primary-100 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-18">
            
            <!-- Enhanced Logo and Title -->
            <div class="flex items-center flex-shrink-0">
              <a href="/admin/dashboard" class="flex items-center space-x-3 hover:opacity-90 transition-all duration-300 group">
                <div class="relative">
                  <span class="text-3xl sm:text-4xl tooth-icon group-hover:scale-110 transition-transform duration-300">🦷</span>
                  <div class="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full opacity-75 animate-pulse"></div>
                </div>
                <div class="hidden sm:block">
                  <h1 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    Aurora Dentica
                  </h1>
                  <p class="text-xs text-primary-500 font-medium">Admin Panel</p>
                </div>
                <div class="sm:hidden">
                  <h1 class="text-lg font-bold text-primary-600">Admin</h1>
                </div>
              </a>
            </div>

            <!-- Enhanced Desktop Navigation -->
            <nav class="hidden lg:flex space-x-1">
              {#each navigation as item}
                <a 
                  href={item.href} 
                  class="nav-link group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 {isCurrentPage(item.href) 
                    ? 'active bg-primary-100 text-primary-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
                  title={item.description}
                >
                  <div class="flex items-center space-x-2">
                    <span class="text-lg group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {#if isCurrentPage(item.href)}
                    <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full"></div>
                  {/if}
                </a>
              {/each}
            </nav>

            <!-- Enhanced Right side - User menu and mobile button -->
            <div class="flex items-center space-x-3">
              
              <!-- Desktop User Menu -->
              <div class="hidden lg:block user-menu-container relative">
                <button 
                  on:click={toggleUserMenu}
                  class="flex items-center space-x-3 text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
                >
                  <div class="relative">
                    <div class="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow duration-300">
                      {getUserInitials()}
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div class="hidden xl:block text-left">
                    <p class="font-medium text-gray-900">{getUserName()}</p>
                    <p class="text-xs text-gray-500">Administrator</p>
                  </div>
                  <svg class="w-4 h-4 transition-transform duration-300 {showUserMenu ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <!-- Enhanced User Dropdown -->
                {#if showUserMenu}
                  <div class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-slide-up">
                    <!-- User Info -->
                    <div class="px-4 py-3 border-b border-gray-100">
                      <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {getUserInitials()}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate">{getUserName()}</p>
                          <p class="text-xs text-gray-500 truncate">{$authStore.user?.email}</p>
                          <p class="text-xs text-primary-600 font-medium">Administrator</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Menu Items -->
                    <div class="py-2">
                      <a href="/admin/dashboard" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                        <span class="mr-3 text-lg">📊</span>
                        <span>Dashboard</span>
                      </a>
                      <a href="/" class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                        <span class="mr-3 text-lg">🌐</span>
                        <span>View Public Site</span>
                      </a>
                      <div class="border-t border-gray-100 my-2"></div>
                      <button 
                        on:click={handleSignOut}
                        class="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span class="mr-3 text-lg">🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Enhanced Mobile menu button -->
              <div class="lg:hidden mobile-menu-container">
                <button
                  on:click={toggleMobileMenu}
                  class="relative text-gray-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl p-3 transition-all duration-300 bg-gray-50 hover:bg-primary-50"
                  aria-label="Toggle menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <div class="w-6 h-6 relative">
                    <span class="absolute inset-0 transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-2'}">
                      <span class="block w-6 h-0.5 bg-current rounded-full"></span>
                    </span>
                    <span class="absolute inset-0 transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : 'opacity-100'}">
                      <span class="block w-6 h-0.5 bg-current rounded-full"></span>
                    </span>
                    <span class="absolute inset-0 transition-all duration-300 {mobileMenuOpen ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-2'}">
                      <span class="block w-6 h-0.5 bg-current rounded-full"></span>
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Enhanced Mobile Navigation -->
          {#if mobileMenuOpen}
            <div class="lg:hidden mobile-nav border-t border-primary-100 bg-white/95 backdrop-blur-md animate-slide-up">
              <div class="px-2 pt-4 pb-6 space-y-1">
                <!-- Navigation Items -->
                {#each navigation as item}
                  <a 
                    href={item.href}
                    class="mobile-nav-item group flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all duration-300 {isCurrentPage(item.href) 
                      ? 'active bg-primary-100 text-primary-700 border-l-4 border-primary-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
                  >
                    <span class="mr-4 text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                    <div class="flex-1">
                      <span class="block">{item.name}</span>
                      <span class="text-xs text-gray-500 mt-0.5">{item.description}</span>
                    </div>
                    {#if isCurrentPage(item.href)}
                      <span class="text-primary-600 text-sm">●</span>
                    {/if}
                  </a>
                {/each}
                
                <!-- Mobile user section -->
                <div class="pt-4 border-t border-primary-100 mt-4">
                  <div class="px-4 py-3 flex items-center space-x-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
                    <div class="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                      {getUserInitials()}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{getUserName()}</p>
                      <p class="text-xs text-gray-500 truncate">{$authStore.user?.email}</p>
                      <p class="text-xs text-primary-600 font-medium">Administrator</p>
                    </div>
                  </div>
                  
                  <div class="mt-2 space-y-1">
                    <a 
                      href="/" 
                      class="mobile-nav-item flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 rounded-xl"
                    >
                      <span class="mr-4 text-xl">🌐</span>
                      <span>View Public Site</span>
                    </a>
                    <button 
                      on:click={handleSignOut}
                      class="mobile-nav-item w-full text-left flex items-center px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 rounded-xl"
                    >
                      <span class="mr-4 text-xl">🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </header>

      <!-- Enhanced Breadcrumb Navigation -->
      <div class="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-4">
            <nav class="flex items-center justify-between" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2 text-sm">
                <li>
                  <a href="/admin/dashboard" class="flex items-center text-gray-500 hover:text-primary-600 transition-colors group">
                    <span class="mr-2 text-lg group-hover:scale-110 transition-transform duration-300">🏠</span>
                    <span class="hidden sm:inline font-medium">Admin</span>
                  </a>
                </li>
                {#if $page.url.pathname !== '/admin/dashboard'}
                  <li class="flex items-center">
                    <svg class="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-gray-700 font-semibold flex items-center gap-2">
                      <span class="text-lg">{navigation.find(item => item.href === $page.url.pathname)?.icon || '📄'}</span>
                      <span>{getCurrentPageName()}</span>
                    </span>
                  </li>
                {/if}
              </ol>
              
              <!-- Quick Actions -->
              <div class="hidden md:flex items-center space-x-2">
                <a href="/admin/appointments" class="btn-ghost btn-sm text-xs">
                  <span>📅</span>
                  <span>Add Appointment</span>
                </a>
                <a href="/admin/inventory" class="btn-ghost btn-sm text-xs">
                  <span>📦</span>
                  <span>Update Stock</span>
                </a>
              </div>
            </nav>
          </div>
        </div>
      </div>
    {/if}

    <!-- Enhanced Main Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <slot />
      </div>
    </main>

    <!-- Enhanced Footer for admin -->
    {#if $authStore.user && $page.url.pathname !== '/admin/login'}
      <footer class="bg-white/80 backdrop-blur-sm border-t border-gray-100 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div class="mb-2 sm:mb-0 flex items-center space-x-4">
              <span class="flex items-center gap-2">
                <span class="text-lg">🦷</span>
                <span>© 2024 Aurora Dentica Admin Panel</span>
              </span>
            </div>
            <div class="flex items-center space-x-4">
              <a href="/" class="hover:text-primary-600 transition-colors flex items-center gap-1">
                <span>🌐</span>
                <span>Public Site</span>
              </a>
              <span class="text-gray-300">•</span>
              <span class="flex items-center gap-1">
                <span>⚡</span>
                <span>Version 1.0</span>
              </span>
              <span class="text-gray-300">•</span>
              <div class="flex items-center gap-1 text-success-600">
                <span>●</span>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    {/if}

  </div>
{:else}
  <!-- Enhanced Fallback for unauthorized access -->
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="relative mb-8">
        <div class="text-6xl sm:text-7xl mb-4 animate-pulse-subtle">🔒</div>
        <div class="absolute -top-2 -right-2 w-8 h-8 bg-error-500 rounded-full flex items-center justify-center">
          <span class="text-white text-xl">!</span>
        </div>
      </div>
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Access Restricted</h2>
      <p class="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed">
        You need to be logged in as an authorized administrator to access the Aurora Dentica admin panel.
      </p>
      <div class="space-y-4">
        <a 
          href="/admin/login" 
          class="btn-primary btn-lg w-full dental-glow"
        >
          <span>🔑</span>
          <span>Go to Admin Login</span>
        </a>
        <a 
          href="/" 
          class="btn-secondary w-full"
        >
          <span>🏠</span>
          <span>Return to Homepage</span>
        </a>
      </div>
      
      <!-- Security notice -->
      <div class="mt-8 p-4 bg-gray-100 rounded-xl text-left">
        <div class="flex items-start space-x-3">
          <span class="text-warning-600 text-lg">⚠️</span>
          <div class="text-xs text-gray-600">
            <p class="font-medium text-gray-800 mb-1">Security Notice</p>
            <p>All login attempts are monitored and logged. Only authorized Aurora Dentica staff should access this system.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Enhanced mobile navigation animations */
  .mobile-nav {
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Enhanced navigation link styles */
  .nav-link {
    position: relative;
    overflow: hidden;
  }

  .nav-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.1), transparent);
    transition: left 0.5s;
  }

  .nav-link:hover::before {
    left: 100%;
  }

  .nav-link.active {
    background: linear-gradient(135deg, rgb(239 246 255) 0%, rgb(219 234 254) 100%);
    border: 1px solid rgb(191 219 254);
  }

  /* Mobile navigation item enhancements */
  .mobile-nav-item {
    position: relative;
    overflow: hidden;
  }

  .mobile-nav-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.05), transparent);
    transition: left 0.3s ease;
  }

  .mobile-nav-item:hover::before {
    left: 100%;
  }

  .mobile-nav-item.active {
    background: linear-gradient(135deg, rgb(239 246 255) 0%, rgb(219 234 254) 100%);
    transform: translateX(4px);
  }

  /* User menu enhancements */
  .user-menu-container .animate-slide-up {
    animation: slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Breadcrumb enhancements */
  nav[aria-label="Breadcrumb"] a:hover span:first-child {
    transform: scale(1.1);
  }

  /* Enhanced loading animation */
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  /* Backdrop blur support detection */
  @supports not (backdrop-filter: blur(10px)) {
    .backdrop-blur-md {
      background-color: rgba(255, 255, 255, 0.95);
    }
    
    .backdrop-blur-sm {
      background-color: rgba(255, 255, 255, 0.9);
    }
  }

  /* Enhanced focus states for accessibility */
  .focus-ring:focus {
    outline: 2px solid rgb(14 165 233);
    outline-offset: 2px;
  }

  /* Smooth transitions for all interactive elements */
  button, a, .nav-link, .mobile-nav-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Enhanced hover effects for cards and interactive elements */
  .card:hover,
  .btn-primary:hover,
  .btn-secondary:hover {
    transform: translateY(-2px);
  }

  /* Custom scrollbar for admin panels */
  .admin-content {
    scrollbar-width: thin;
    scrollbar-color: rgb(14 165 233) rgb(248 250 252);
  }

  .admin-content::-webkit-scrollbar {
    width: 8px;
  }

  .admin-content::-webkit-scrollbar-track {
    background: rgb(248 250 252);
    border-radius: 4px;
  }

  .admin-content::-webkit-scrollbar-thumb {
    background: linear-gradient(145deg, rgb(14 165 233), rgb(2 132 199));
    border-radius: 4px;
    border: 1px solid rgb(248 250 252);
  }

  .admin-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(145deg, rgb(2 132 199), rgb(3 105 161));
  }
</style>