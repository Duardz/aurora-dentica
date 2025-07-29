<script lang="ts">
  import { onMount } from 'svelte';
  
  let mobileMenuOpen = false;
  let scrolled = false;

  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 20;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  // Navigation items
  const navItems = [
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Promotions', href: '#promotions' },
    { name: 'Contact', href: '#contact' }
  ];
</script>

<!-- Enhanced Professional Navigation -->
<nav class="fixed top-0 w-full z-50 transition-all duration-300 {scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm'} border-b border-slate-200/50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20">
      
      <!-- Enhanced Logo -->
      <div class="flex items-center group">
        <a href="/" class="flex items-center space-x-3 transition-all duration-300 hover:scale-105">
          <div class="relative">
            <!-- Main logo circle -->
            <div class="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center transform group-hover:rotate-3 transition-all duration-300">
              <span class="text-white text-xl font-bold">AD</span>
            </div>
            <!-- Status indicator -->
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Aurora Dentica</h1>
            <p class="text-xs text-blue-600 font-medium">Professional Dental Care</p>
          </div>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center space-x-1">
        {#each navItems as item}
          <a 
            href={item.href} 
            class="relative px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all duration-300 rounded-xl hover:bg-blue-50 group"
          >
            <span class="relative z-10">{item.name}</span>
            <!-- Hover effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <!-- Active indicator -->
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-8 transition-all duration-300"></div>
          </a>
        {/each}
      </div>

      <!-- Enhanced CTA Button -->
      <div class="hidden lg:flex items-center space-x-4">
        <a 
          href="/contact" 
          class="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 group"
        >
          <!-- Shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div class="relative flex items-center gap-2">
            <span class="text-lg">📅</span>
            <span>Book Appointment</span>
          </div>
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <div class="lg:hidden">
        <button
          on:click={toggleMobileMenu}
          class="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-300 group"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <div class="w-6 h-6 relative">
            <span class="absolute top-0 left-0 w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''} group-hover:bg-blue-600"></span>
            <span class="absolute top-2.5 left-0 w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : ''} group-hover:bg-blue-600"></span>
            <span class="absolute top-5 left-0 w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''} group-hover:bg-blue-600"></span>
          </div>
        </button>
      </div>
    </div>

    <!-- Enhanced Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 rounded-b-2xl shadow-xl">
        <div class="px-4 py-6 space-y-2">
          {#each navItems as item}
            <a 
              href={item.href} 
              on:click={closeMobileMenu}
              class="block p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
            >
              <div class="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{item.name}</div>
            </a>
          {/each}
          
          <div class="pt-4 border-t border-slate-200">
            <a 
              href="/contact" 
              on:click={closeMobileMenu}
              class="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg"
            >
              <div class="flex items-center justify-center gap-2">
                <span>📅</span>
                <span>Book Appointment</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>

<style>
  /* Enhanced mobile menu animation */
  @media (max-width: 1024px) {
    .mobile-menu-enter {
      animation: slideDown 0.3s ease-out;
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Smooth focus states */
  a:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 0.75rem;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>