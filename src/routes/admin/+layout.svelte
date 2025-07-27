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
      description: 'Overview & Analytics',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      name: 'Appointments', 
      href: '/admin/appointments', 
      icon: '📅',
      description: 'Patient Scheduling',
      color: 'from-green-500 to-green-600'
    },
    { 
      name: 'Inventory', 
      href: '/admin/inventory', 
      icon: '📦',
      description: 'Supply Management',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      name: 'Promotions', 
      href: '/admin/promos', 
      icon: '🎉',
      description: 'Marketing Campaigns',
      color: 'from-orange-500 to-orange-600'
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

  function getUserEmail(): string {
    return $authStore.user?.email || 'admin@example.com';
  }
</script>

{#if loading}
  <!-- Enhanced Loading Screen with Dental Theme -->
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
    <div class="text-center space-y-6">
      <!-- Animated Logo -->
      <div class="relative mx-auto w-20 h-20">
        <div class="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl animate-pulse"></div>
        <div class="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
          <span class="text-2xl animate-bounce">🦷</span>
        </div>
      </div>
      
      <!-- Loading Text -->
      <div class="space-y-2">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          Aurora Dentica
        </h2>
        <div class="flex items-center justify-center space-x-2">
          <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        <p class="text-gray-600 font-medium">Loading admin panel...</p>
      </div>
    </div>
  </div>
{:else if $authStore.user || $page.url.pathname === '/admin/login'}
  <!-- Enhanced Admin Interface -->
  <div class="min-h-screen bg-gray-50">
    
    {#if $authStore.user && $page.url.pathname !== '/admin/login'}
      <!-- Mobile-First Responsive Header -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            
            <!-- Logo Section -->
            <div class="flex items-center min-w-0 flex-1 lg:flex-initial">
              <a href="/admin/dashboard" class="flex items-center space-x-3 hover:opacity-90 transition-opacity group">
                <!-- Responsive Logo -->
                <div class="relative flex-shrink-0">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-md flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <span class="text-white text-lg sm:text-xl font-bold">🦷</span>
                  </div>
                  <!-- Online indicator -->
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <!-- Brand Text - Responsive -->
                <div class="hidden sm:block min-w-0">
                  <h1 class="text-xl font-bold text-gray-900 truncate">Aurora Dentica</h1>
                  <p class="text-xs text-primary-600 font-medium">Admin Panel</p>
                </div>
              </a>
            </div>

            <!-- Desktop Navigation - Hidden on mobile -->
            <nav class="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl">
              {#each navigation as item}
                <a 
                  href={item.href} 
                  class="group relative flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-gray-50 {isCurrentPage(item.href) 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900'}"
                  title={item.description}
                >
                  <span class="text-lg mr-2 group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                  <span class="truncate">{item.name}</span>
                  
                  <!-- Active indicator -->
                  {#if isCurrentPage(item.href)}
                    <div class="absolute inset-0 bg-gradient-to-r {item.color} opacity-10 rounded-xl"></div>
                    <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full"></div>
                  {/if}
                </a>
              {/each}
            </nav>

            <!-- Right Section -->
            <div class="flex items-center space-x-2 sm:space-x-4 flex-1 justify-end lg:flex-initial">
              
              <!-- Quick Actions - Desktop only -->
              <div class="hidden xl:flex items-center space-x-2">
                <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Notifications">
                  <span class="text-lg">🔔</span>
                </button>
                <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Help">
                  <span class="text-lg">❓</span>
                </button>
              </div>

              <!-- User Menu - Desktop -->
              <div class="hidden lg:block user-menu-container relative">
                <button 
                  on:click={toggleUserMenu}
                  class="flex items-center space-x-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors group"
                >
                  <!-- Avatar -->
                  <div class="relative flex-shrink-0">
                    <div class="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {getUserInitials()}
                    </div>
                    <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                  </div>
                  
                  <!-- User Info - Hidden on small screens -->
                  <div class="hidden xl:block text-left min-w-0">
                    <p class="font-medium text-gray-900 truncate text-xs">{getUserName()}</p>
                    <p class="text-xs text-gray-500 truncate">Administrator</p>
                  </div>
                  
                  <!-- Dropdown Arrow -->
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200 {showUserMenu ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <!-- Enhanced User Dropdown -->
                {#if showUserMenu}
                  <div class="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                    <!-- User Info Header -->
                    <div class="px-4 py-3 border-b border-gray-100">
                      <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {getUserInitials()}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-semibold text-gray-900 truncate">{getUserName()}</p>
                          <p class="text-xs text-gray-500 truncate">{getUserEmail()}</p>
                          <div class="flex items-center mt-1">
                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span class="text-xs text-green-600 font-medium">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Menu Items -->
                    <div class="py-1">
                      <a href="/admin/dashboard" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span class="mr-3 text-base">📊</span>
                        <span>Dashboard</span>
                      </a>
                      <a href="/" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span class="mr-3 text-base">🌐</span>
                        <span>Public Website</span>
                      </a>
                      <div class="border-t border-gray-100 my-1"></div>
                      <button 
                        on:click={handleSignOut}
                        class="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span class="mr-3 text-base">🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Mobile Menu Button -->
              <div class="lg:hidden mobile-menu-container">
                <button
                  on:click={toggleMobileMenu}
                  class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <!-- Hamburger Icon -->
                  <div class="w-6 h-6 relative">
                    <span class="absolute top-0 left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-2.5' : 'rotate-0 translate-y-0'}"></span>
                    <span class="absolute top-2.5 left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : 'opacity-100'}"></span>
                    <span class="absolute top-5 left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-2.5' : 'rotate-0 translate-y-0'}"></span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Enhanced Mobile Navigation -->
          {#if mobileMenuOpen}
            <div class="lg:hidden bg-white border-t border-gray-100 animate-slide-down">
              <div class="px-4 py-4 space-y-2">
                
                <!-- Mobile User Info -->
                <div class="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {getUserInitials()}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-900 truncate">{getUserName()}</p>
                      <p class="text-xs text-gray-500 truncate">{getUserEmail()}</p>
                      <div class="flex items-center mt-1">
                        <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span class="text-xs text-green-600 font-medium">Administrator</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mobile Navigation Items -->
                {#each navigation as item}
                  <a 
                    href={item.href}
                    class="group flex items-center p-4 rounded-xl text-base font-medium transition-all duration-200 {isCurrentPage(item.href) 
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
                  >
                    <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br {item.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-200">
                      <span class="text-white text-lg">{item.icon}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold truncate">{item.name}</p>
                      <p class="text-sm text-gray-500 truncate">{item.description}</p>
                    </div>
                    {#if isCurrentPage(item.href)}
                      <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                    {/if}
                  </a>
                {/each}
                
                <!-- Mobile Quick Actions -->
                <div class="pt-4 border-t border-gray-100 space-y-2">
                  <a 
                    href="/" 
                    class="flex items-center p-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <span class="mr-3 text-lg">🌐</span>
                    <span>Public Website</span>
                  </a>
                  <button 
                    on:click={handleSignOut}
                    class="w-full text-left flex items-center p-3 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <span class="mr-3 text-lg">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </header>

      <!-- Enhanced Breadcrumb Navigation -->
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between py-3">
            <!-- Breadcrumb -->
            <nav class="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
              <a href="/admin/dashboard" class="flex items-center text-gray-500 hover:text-primary-600 transition-colors group">
                <span class="mr-2 text-base group-hover:scale-110 transition-transform duration-200">🏠</span>
                <span class="hidden sm:inline font-medium">Admin</span>
                <span class="sm:hidden font-medium">Home</span>
              </a>
              {#if $page.url.pathname !== '/admin/dashboard'}
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="font-semibold text-gray-900 flex items-center gap-2">
                  <span class="text-base">{navigation.find(item => item.href === $page.url.pathname)?.icon || '📄'}</span>
                  <span>{getCurrentPageName()}</span>
                </span>
              {/if}
            </nav>
            
            <!-- Quick Actions -->
            <div class="hidden md:flex items-center space-x-2">
              <div class="flex items-center space-x-1 text-xs text-gray-500">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Enhanced Main Content Area -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <slot />
      </div>
    </main>

    <!-- Enhanced Admin Footer -->
    {#if $authStore.user && $page.url.pathname !== '/admin/login'}
      <footer class="bg-white border-t border-gray-100 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <!-- Brand -->
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <span class="text-base">🦷</span>
              <span>© 2024 Aurora Dentica Admin Panel</span>
            </div>
            
            <!-- Links & Status -->
            <div class="flex items-center space-x-4 text-sm">
              <a href="/" class="text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1">
                <span class="text-sm">🌐</span>
                <span>Public Site</span>
              </a>
              <span class="text-gray-300">•</span>
              <div class="flex items-center gap-1 text-green-600">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
              <span class="text-gray-300">•</span>
              <span class="text-gray-500">v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    {/if}

  </div>
{:else}
  <!-- Enhanced Unauthorized Access Screen -->
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
    <div class="text-center max-w-md space-y-8">
      <!-- Icon -->
      <div class="relative mx-auto w-24 h-24">
        <div class="absolute inset-0 bg-red-100 rounded-full"></div>
        <div class="absolute inset-4 bg-red-500 rounded-full flex items-center justify-center">
          <span class="text-white text-2xl">🔒</span>
        </div>
        <div class="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <span class="text-white text-lg">!</span>
        </div>
      </div>
      
      <!-- Content -->
      <div class="space-y-4">
        <h2 class="text-3xl font-bold text-gray-900">Access Restricted</h2>
        <p class="text-gray-600 leading-relaxed">
          You need to be logged in as an authorized administrator to access the Aurora Dentica admin panel.
        </p>
      </div>
      
      <!-- Actions -->
      <div class="space-y-4">
        <a 
          href="/admin/login" 
          class="block w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <span class="mr-2">🔑</span>
          <span>Go to Admin Login</span>
        </a>
        <a 
          href="/" 
          class="block w-full bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span class="mr-2">🏠</span>
          <span>Return to Homepage</span>
        </a>
      </div>
      
      <!-- Security Notice -->
      <div class="bg-gray-100 rounded-xl p-4 text-left">
        <div class="flex items-start space-x-3">
          <span class="text-yellow-600 text-lg flex-shrink-0">⚠️</span>
          <div class="text-xs text-gray-600 space-y-1">
            <p class="font-semibold text-gray-800">Security Notice</p>
            <p>All login attempts are monitored and logged. Only authorized Aurora Dentica staff should access this system.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Enhanced animations */
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  .animate-slide-down {
    animation: slide-down 0.2s ease-out;
  }

  /* Smooth scrolling */
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Enhanced focus styles */
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid #0ea5e9;
    outline-offset: 2px;
    border-radius: 0.5rem;
  }

  /* Mobile menu backdrop blur */
  @supports (backdrop-filter: blur(10px)) {
    .mobile-menu-backdrop {
      backdrop-filter: blur(10px);
    }
  }

  /* Custom scrollbar for navigation areas */
  .nav-scroll {
    scrollbar-width: thin;
    scrollbar-color: #7dd3fc #f1f5f9;
  }

  .nav-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .nav-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .nav-scroll::-webkit-scrollbar-thumb {
    background: #7dd3fc;
    border-radius: 3px;
  }

  .nav-scroll::-webkit-scrollbar-thumb:hover {
    background: #38bdf8;
  }

  /* Enhanced hover effects */
  .nav-item-hover {
    position: relative;
    overflow: hidden;
  }

  .nav-item-hover::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.1), transparent);
    transition: left 0.5s ease;
  }

  .nav-item-hover:hover::before {
    left: 100%;
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .nav-item {
      border: 1px solid currentColor;
    }
    
    .user-avatar {
      border: 2px solid currentColor;
    }
  }

  /* Print styles */
  @media print {
    :global(header),
    :global(footer),
    :global(.mobile-menu-container),
    :global(.user-menu-container) {
      display: none !important;
    }
    
    :global(main) {
      padding: 0 !important;
      margin: 0 !important;
    }
  }
</style>