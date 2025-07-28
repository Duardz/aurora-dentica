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
      icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-2 2V6H5v14h14v-2.586l2-2V20a1 1 0 01-1 1H4a1 1 0 01-1-1V4z',
      description: 'Overview & Analytics',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      name: 'Appointments', 
      href: '/admin/appointments', 
      icon: 'M8 7V3a1 1 0 012 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h4z',
      description: 'Patient Scheduling',
      color: 'from-green-500 to-green-600'
    },
    { 
      name: 'Inventory', 
      href: '/admin/inventory', 
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
      description: 'Supply Management',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      name: 'Promotions', 
      href: '/admin/promos', 
      icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
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
  <!-- Enhanced Loading Screen -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center space-y-6">
      <!-- Modern Loading Animation -->
      <div class="relative w-16 h-16 mx-auto">
        <div class="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      <!-- Loading Text -->
      <div class="space-y-2">
        <h2 class="text-xl font-semibold text-gray-900">
          Aurora Dentica
        </h2>
        <p class="text-gray-600">Loading admin panel...</p>
      </div>
    </div>
  </div>
{:else if $authStore.user || $page.url.pathname === '/admin/login'}
  <!-- Enhanced Admin Interface -->
  <div class="min-h-screen bg-gray-50">
    
    {#if $authStore.user && $page.url.pathname !== '/admin/login'}
      <!-- Enhanced Responsive Header -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            
            <!-- Logo Section -->
            <div class="flex items-center min-w-0 flex-1 lg:flex-initial">
              <a href="/admin/dashboard" class="flex items-center space-x-3 hover:opacity-90 transition-opacity group">
                <!-- Professional Logo -->
                <div class="relative flex-shrink-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <!-- Status indicator -->
                  <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <!-- Brand Text -->
                <div class="hidden sm:block min-w-0">
                  <h1 class="text-lg sm:text-xl font-bold text-gray-900 truncate">Aurora Dentica</h1>
                  <p class="text-xs text-primary-600 font-medium">Admin Panel</p>
                </div>
              </a>
            </div>

            <!-- Desktop Navigation -->
            <nav class="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl">
              {#each navigation as item}
                <a 
                  href={item.href} 
                  class="group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50 {isCurrentPage(item.href) 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900'}"
                  title={item.description}
                >
                  <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}></path>
                  </svg>
                  <span class="truncate">{item.name}</span>
                  
                  <!-- Active indicator -->
                  {#if isCurrentPage(item.href)}
                    <div class="absolute inset-0 bg-gradient-to-r {item.color} opacity-10 rounded-lg"></div>
                    <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full"></div>
                  {/if}
                </a>
              {/each}
            </nav>

            <!-- Right Section -->
            <div class="flex items-center space-x-2 sm:space-x-4 flex-1 justify-end lg:flex-initial">
              
              <!-- Quick Actions - Desktop -->
              <div class="hidden xl:flex items-center space-x-2">
                <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative" title="Notifications">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  <!-- Notification badge -->
                  <div class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
                <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Help">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
              </div>

              <!-- User Menu - Desktop -->
              <div class="hidden lg:block user-menu-container relative">
                <button 
                  on:click={toggleUserMenu}
                  class="flex items-center space-x-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors group"
                >
                  <!-- Avatar -->
                  <div class="relative flex-shrink-0">
                    <div class="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {getUserInitials()}
                    </div>
                    <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                  </div>
                  
                  <!-- User Info -->
                  <div class="hidden xl:block text-left min-w-0">
                    <p class="font-medium text-gray-900 truncate text-sm">{getUserName()}</p>
                    <p class="text-xs text-gray-500 truncate">Administrator</p>
                  </div>
                  
                  <!-- Dropdown Arrow -->
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200 {showUserMenu ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <!-- Enhanced User Dropdown -->
                {#if showUserMenu}
                  <div class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                    <!-- User Info Header -->
                    <div class="px-4 py-3 border-b border-gray-100">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold">
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
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-2 2V6H5v14h14v-2.586l2-2V20a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"></path>
                        </svg>
                        <span>Dashboard</span>
                      </a>
                      <a href="/" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Public Website</span>
                      </a>
                      <div class="border-t border-gray-100 my-1"></div>
                      <button 
                        on:click={handleSignOut}
                        class="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
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
              <div class="px-4 py-6 space-y-2">
                
                <!-- Mobile User Info -->
                <div class="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 mb-6">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold">
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
                    <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br {item.color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-200">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}></path>
                      </svg>
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
                <div class="pt-6 border-t border-gray-100 space-y-2">
                  <a 
                    href="/" 
                    class="flex items-center p-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Public Website</span>
                  </a>
                  <button 
                    on:click={handleSignOut}
                    class="w-full text-left flex items-center p-3 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
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
          <div class="flex items-center justify-between py-4">
            <!-- Breadcrumb -->
            <nav class="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
              <a href="/admin/dashboard" class="flex items-center text-gray-500 hover:text-primary-600 transition-colors group">
                <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span class="hidden sm:inline font-medium">Admin</span>
                <span class="sm:hidden font-medium">Home</span>
              </a>
              {#if $page.url.pathname !== '/admin/dashboard'}
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="font-semibold text-gray-900 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={navigation.find(item => item.href === $page.url.pathname)?.icon || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'}></path>
                  </svg>
                  <span>{getCurrentPageName()}</span>
                </span>
              {/if}
            </nav>
            
            <!-- System Status -->
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
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>© 2024 Aurora Dentica Admin Panel</span>
            </div>
            
            <!-- Links & Status -->
            <div class="flex items-center space-x-4 text-sm">
              <a href="/" class="text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
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
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="text-center max-w-md space-y-8">
      <!-- Icon -->
      <div class="relative mx-auto w-20 h-20">
        <div class="absolute inset-0 bg-red-100 rounded-full"></div>
        <div class="absolute inset-4 bg-red-500 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
      </div>
      
      <!-- Content -->
      <div class="space-y-4">
        <h2 class="text-2xl font-bold text-gray-900">Access Restricted</h2>
        <p class="text-gray-600 leading-relaxed">
          You need to be logged in as an authorized administrator to access the Aurora Dentica admin panel.
        </p>
      </div>
      
      <!-- Actions -->
      <div class="space-y-4">
        <a 
          href="/admin/login" 
          class="block w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>Go to Admin Login</span>
        </a>
        <a 
          href="/" 
          class="block w-full bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span>Return to Homepage</span>
        </a>
      </div>
      
      <!-- Security Notice -->
      <div class="bg-gray-100 rounded-lg p-4 text-left">
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
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

  /* Custom scrollbar for navigation areas */
  .nav-scroll {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  .nav-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .nav-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .nav-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .nav-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
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
    header,
    footer,
    .mobile-menu-container,
    .user-menu-container {
      display: none !important;
    }
    
    main {
      padding: 0 !important;
      margin: 0 !important;
    }
  }
</style>