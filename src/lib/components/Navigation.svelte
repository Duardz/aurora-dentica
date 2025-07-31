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

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];
</script>

<!-- Simple Clean Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled ? 'bg-white shadow-lg' : 'bg-white/95'}">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/" class="flex items-center space-x-3 group" on:click={closeMobileMenu}>
          <div class="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span class="text-white font-bold text-lg">AD</span>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-xl font-bold text-gray-800">Aurora Dentica</h1>
            <p class="text-xs text-amber-600 font-medium">Professional Care</p>
          </div>
        </a>
      </div>

      <!-- Desktop Menu (Hidden on mobile) -->
      <div class="hidden md:flex items-center space-x-8">
        {#each navItems as item}
          <a 
            href={item.href} 
            class="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-amber-500"
          >
            {item.name}
          </a>
        {/each}
      </div>

      <!-- Desktop CTA (Hidden on mobile) -->
      <div class="hidden md:flex items-center space-x-4">
        <a 
          href="tel:042-123-4567" 
          class="text-sm text-gray-600 hover:text-amber-600 transition-colors"
        >
          (042) 123-4567
        </a>
        <a 
          href="#contact" 
          class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          Book Now
        </a>
      </div>

      <!-- Mobile Hamburger Button (Only visible on mobile) -->
      <div class="md:hidden">
        <button
          on:click={toggleMobileMenu}
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <div class="w-6 h-6 flex flex-col justify-center items-center">
            <span class="block w-5 h-0.5 bg-gray-600 transition-all duration-200 {mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}"></span>
            <span class="block w-5 h-0.5 bg-gray-600 transition-all duration-200 {mobileMenuOpen ? 'opacity-0' : 'opacity-100'}"></span>
            <span class="block w-5 h-0.5 bg-gray-600 transition-all duration-200 {mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}"></span>
          </div>
        </button>
      </div>
    </div>

    <!-- Mobile Menu (Only shows on mobile when hamburger is clicked) -->
    {#if mobileMenuOpen}
      <div class="md:hidden border-t border-gray-200 bg-white">
        <div class="px-2 pt-2 pb-3 space-y-1">
          {#each navItems as item}
            <a 
              href={item.href} 
              class="block px-3 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg font-medium transition-colors"
              on:click={closeMobileMenu}
            >
              {item.name}
            </a>
          {/each}
          
          <!-- Mobile Contact -->
          <div class="px-3 py-3 border-t border-gray-200 mt-3">
            <a 
              href="tel:042-123-4567" 
              class="block text-gray-600 hover:text-amber-600 transition-colors mb-3"
            >
              📞 (042) 123-4567
            </a>
            <a 
              href="#contact" 
              class="block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-lg font-medium text-center hover:shadow-md transition-all"
              on:click={closeMobileMenu}
            >
              Book Appointment
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>

<style>
  /* Ensure nav stays on top */
  nav {
    backdrop-filter: blur(10px);
  }

  /* Smooth transitions */
  a {
    text-decoration: none;
  }

  /* Mobile menu animation */
  .md\:hidden div {
    animation: slideDown 0.2s ease-out;
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

  /* Focus states for accessibility */
  a:focus,
  button:focus {
    outline: 2px solid #d97706;
    outline-offset: 2px;
    border-radius: 0.375rem;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .space-y-1 > * {
      margin-top: 0;
      margin-bottom: 0.25rem;
    }
  }
</style>