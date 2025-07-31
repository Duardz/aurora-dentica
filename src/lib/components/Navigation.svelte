<script lang="ts">
  import { onMount } from 'svelte';
  
  let mobileMenuOpen = false;
  let scrolled = false;
  let currentPath = '';

  onMount(() => {
    // Handle scroll effects
    const handleScroll = () => {
      scrolled = window.scrollY > 10;
    };

    // Get current path for active states
    currentPath = window.location.pathname;

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    
    // Better body scroll management
    if (typeof document !== 'undefined') {
      if (mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.classList.add('menu-open');
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.classList.remove('menu-open');
      }
    }
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
    
    // Restore body scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.classList.remove('menu-open');
    }
  }

  // Navigation items with enhanced structure
  const navItems = [
    { 
      name: 'Services', 
      href: '#services',
      icon: '🦷',
      description: 'Our dental services'
    },
    { 
      name: 'About', 
      href: '#about',
      icon: '👨‍⚕️',
      description: 'Our professional team'
    },
    { 
      name: 'Promotions', 
      href: '#promotions',
      icon: '🏷️',
      description: 'Special offers'
    },
    { 
      name: 'Contact', 
      href: '#contact',
      icon: '📍',
      description: 'Visit our clinic'
    }
  ];
</script>

<!-- REDESIGNED Professional Navigation -->
<nav class="fixed top-0 w-full z-50 transition-all duration-500 {scrolled ? 'bg-white/98 backdrop-blur-xl shadow-xl border-b border-stone-200/60' : 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-stone-100/50'}">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20 lg:h-24">
      
      <!-- ENHANCED Logo Section -->
      <div class="flex items-center group">
        <a href="/" class="flex items-center space-x-4 transition-all duration-300 hover:scale-105" on:click={closeMobileMenu}>
          <div class="relative">
            <!-- Main logo with improved design -->
            <div class="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-2xl lg:rounded-3xl shadow-xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-500 border-2 border-white/20">
              <span class="text-white text-xl lg:text-2xl font-bold tracking-tight">AD</span>
            </div>
            
            <!-- Status indicator with pulse -->
            <div class="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-3 border-white shadow-lg">
              <div class="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-40"></div>
              <div class="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                <div class="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
            
            <!-- Floating badge -->
            <div class="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs lg:text-sm font-bold px-2 py-1 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              2009
            </div>
          </div>
          
          <div class="hidden sm:block">
            <div class="space-y-1">
              <h1 class="text-xl lg:text-2xl font-bold bg-gradient-to-r from-stone-800 via-amber-700 to-orange-700 bg-clip-text text-transparent leading-tight">
                Aurora Dentica
              </h1>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p class="text-xs lg:text-sm text-amber-600 font-semibold tracking-wide">PROFESSIONAL DENTAL CARE</p>
              </div>
            </div>
          </div>
        </a>
      </div>

      <!-- ENHANCED Desktop Navigation -->
      <div class="hidden lg:flex items-center space-x-2">
        {#each navItems as item}
          <a 
            href={item.href} 
            class="group relative px-4 py-3 text-stone-700 hover:text-amber-700 font-semibold transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-lg border-2 border-transparent hover:border-amber-200/50"
            on:click={closeMobileMenu}
          >
            <div class="flex items-center gap-2">
              <span class="text-lg group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
              <span class="relative">
                {item.name}
                <!-- Animated underline -->
                <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 group-hover:w-full transition-all duration-300 rounded-full"></div>
              </span>
            </div>
            
            <!-- Hover tooltip -->
            <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-stone-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
              {item.description}
              <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-stone-800 rotate-45"></div>
            </div>
          </a>
        {/each}
      </div>

      <!-- ENHANCED CTA & Emergency Info -->
      <div class="hidden lg:flex items-center space-x-4">
        <!-- Emergency contact -->
        <div class="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-2 rounded-2xl border-2 border-red-200/50 hover:border-red-300 transition-all duration-300 group">
          <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <div class="text-sm">
            <div class="text-red-700 font-bold">Emergency</div>
            <a href="tel:+6391234568" class="text-red-600 font-semibold hover:text-red-700 transition-colors">
              (042) 123-4568
            </a>
          </div>
        </div>
        
        <!-- Main CTA Button -->
        <a 
          href="/contact" 
          class="group relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-bold transition-all duration-500 hover:shadow-2xl hover:scale-105 border-2 border-white/20"
        >
          <!-- Shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          <div class="relative flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 012 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h4z"/>
              </svg>
            </div>
            <div class="text-left">
              <div class="text-sm font-bold leading-tight">Book</div>
              <div class="text-xs text-orange-100 leading-tight">Appointment</div>
            </div>
          </div>
        </a>
      </div>

      <!-- ENHANCED Mobile Menu Button - FIXED -->
      <div class="lg:hidden">
        <button
          on:click={toggleMobileMenu}
          class="hamburger-button relative p-3 rounded-2xl bg-gradient-to-r from-stone-100 to-amber-50 hover:from-amber-100 hover:to-orange-100 border-2 border-stone-200 hover:border-amber-300 transition-all duration-300 group shadow-lg hover:shadow-xl {mobileMenuOpen ? 'hamburger-active' : ''}"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <div class="w-6 h-6 relative flex flex-col justify-center space-y-1">
            <!-- Simplified hamburger lines -->
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </div>
        </button>
      </div>
    </div>

    <!-- COMPLETELY REDESIGNED Mobile Navigation - FIXED -->
    {#if mobileMenuOpen}
      <!-- Mobile Menu Overlay -->
      <div class="lg:hidden fixed inset-0 z-50 animate-in" style="top: 80px;">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" on:click={closeMobileMenu}></div>
        
        <!-- Menu Content -->
        <div class="relative bg-white/98 backdrop-blur-xl min-h-full overflow-y-auto shadow-2xl">
          <div class="px-6 py-8 space-y-6">
            
            <!-- Mobile header -->
            <div class="text-center pb-6 border-b border-stone-200">
              <h2 class="text-2xl font-bold text-stone-900 mb-2">Navigation</h2>
              <p class="text-stone-600">Professional dental care since 2009</p>
            </div>
            
            <!-- Enhanced Mobile Navigation Items -->
            <div class="space-y-4">
              {#each navItems as item, index}
                <a 
                  href={item.href} 
                  on:click={closeMobileMenu}
                  class="mobile-menu-item group block p-6 rounded-3xl bg-gradient-to-r from-white to-stone-50 border-2 border-stone-200 hover:border-amber-300 hover:from-amber-50 hover:to-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  style="animation-delay: {index * 100}ms;"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                        <span class="text-2xl">{item.icon}</span>
                      </div>
                      <div>
                        <div class="font-bold text-lg text-stone-900 group-hover:text-amber-700 transition-colors">{item.name}</div>
                        <div class="text-sm text-stone-600 group-hover:text-amber-600 transition-colors">{item.description}</div>
                      </div>
                    </div>
                    <svg class="w-6 h-6 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </a>
              {/each}
            </div>
            
            <!-- Mobile Contact Section -->
            <div class="pt-6 border-t border-stone-200 space-y-4">
              <!-- Emergency Contact -->
              <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-6 border-2 border-red-200/50">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <div class="font-bold text-red-800">24/7 Emergency</div>
                    <a href="tel:+6391234568" class="text-lg font-bold text-red-700 hover:text-red-800 transition-colors">
                      (042) 123-4568
                    </a>
                  </div>
                </div>
              </div>

              <!-- Main CTA -->
              <a 
                href="/contact" 
                on:click={closeMobileMenu}
                class="group block w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white p-6 rounded-3xl font-bold text-lg transition-all duration-300 hover:shadow-2xl relative overflow-hidden"
              >
                <!-- Shimmer effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div class="relative flex items-center justify-center gap-4">
                  <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 012 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h4z"/>
                    </svg>
                  </div>
                  <div class="text-left">
                    <div class="text-xl font-bold">Book Appointment</div>
                    <div class="text-orange-100 text-sm">Quick & Easy Online</div>
                  </div>
                </div>
              </a>
              
              <!-- Quick Contact Info -->
              <div class="grid grid-cols-1 gap-4">
                <div class="bg-white rounded-2xl p-4 shadow-lg border border-stone-200">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </div>
                    <div>
                      <div class="font-semibold text-stone-900">General Line</div>
                      <a href="tel:+6391234567" class="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                        (042) 123-4567
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>

<style>
  /* Enhanced mobile menu animation */
  .animate-in {
    animation: slideDown 0.3s ease-out;
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

  /* Enhanced focus states */
  a:focus-visible,
  button:focus-visible {
    outline: 3px solid #d97706;
    outline-offset: 2px;
    border-radius: 1rem;
  }

  /* Backdrop blur support */
  @supports (backdrop-filter: blur(20px)) {
    .backdrop-blur-xl {
      backdrop-filter: blur(20px);
    }
    .backdrop-blur-lg {
      backdrop-filter: blur(16px);
    }
    .backdrop-blur-sm {
      backdrop-filter: blur(4px);
    }
  }

  /* FIXED Mobile menu styles */
  @media (max-width: 1024px) {
    /* Ensure mobile menu is above everything */
    .mobile-menu-overlay {
      position: fixed;
      top: 80px;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
    }

    /* Prevent body scroll when menu is open */
    body.menu-open {
      overflow: hidden;
      position: fixed;
      width: 100%;
    }

    /* Mobile menu item animations */
    .mobile-menu-item {
      animation: slideInLeft 0.3s ease-out forwards;
      opacity: 0;
      transform: translateX(-20px);
    }
    
    .mobile-menu-item:nth-child(1) { animation-delay: 0.1s; }
    .mobile-menu-item:nth-child(2) { animation-delay: 0.2s; }
    .mobile-menu-item:nth-child(3) { animation-delay: 0.3s; }
    .mobile-menu-item:nth-child(4) { animation-delay: 0.4s; }

    /* Hamburger button improvements */
    .hamburger-button {
      position: relative;
      z-index: 10000;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    /* Make sure hamburger lines are visible */
    .hamburger-line {
      display: block;
      width: 100%;
      height: 2px;
      background: linear-gradient(135deg, #78716c, #d97706);
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
    }

    /* Active hamburger state */
    .hamburger-active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .hamburger-active .hamburger-line:nth-child(2) {
      opacity: 0;
      transform: translateX(20px);
    }

    .hamburger-active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }

    /* Mobile menu content positioning */
    .mobile-menu-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  @keyframes slideInLeft {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Improved touch targets for mobile */
  @media (max-width: 1024px) {
    button, a {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    nav {
      background: #fff !important;
      border-bottom: 2px solid #000 !important;
    }
    
    .bg-gradient-to-r {
      background: #000 !important;
      color: #fff !important;
    }
  }

  /* Ensure nav is always on top */
  nav {
    z-index: 1000;
  }

  /* Mobile menu specific z-index */
  .mobile-menu-overlay {
    z-index: 9999;
  }
</style>